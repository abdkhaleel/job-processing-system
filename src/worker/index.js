require('dotenv').config();
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const TABLE_NAME = process.env.DYNAMODB_TABLE;
const REGION = process.env.AWS_REGION || 'us-east-1';

const clientConfig = {
  region: REGION,
  endpoint: process.env.LOCALSTACK_ENDPOINT || undefined,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
};

const sqs = new SQSClient(clientConfig);
const db = new DynamoDBClient(clientConfig);

const pollQueue = async () => {
  console.log('Waiting for messages...');

  try {
    const { Messages } = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20, 
    }));

    if (!Messages || Messages.length === 0) {
      return pollQueue();
    }

    const message = Messages[0];
    await processMessage(message);
    
    pollQueue();

  } catch (err) {
    console.error('Polling Error:', err);
    setTimeout(pollQueue, 5000);
  }
};

const processMessage = async (message) => {
  const body = JSON.parse(message.Body);
  const { orderId, item, quantity } = body;

  console.log(`Processing Order: ${orderId}`);

  try {
    const params = {
      TableName: TABLE_NAME,
      Item: marshall({
        order_id: orderId,
        status: 'PROCESSED',
        item,
        quantity,
        processed_at: new Date().toISOString()
      }),
      ConditionExpression: 'attribute_not_exists(order_id)'
    };

    await db.send(new PutItemCommand(params));
    console.log(`Order ${orderId} saved to DB.`);

    await sqs.send(new DeleteMessageCommand({
      QueueUrl: QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle
    }));
    console.log(`Message deleted from Queue.`);

  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      console.warn(`Duplicate Order detected: ${orderId}. Ignoring.`);
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle
      }));
    } else {
      console.error(`Processing failed for ${orderId}:`, err);
    }
  }
};

pollQueue();