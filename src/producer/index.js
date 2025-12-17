require('dotenv').config();
const express = require('express');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REGION = process.env.AWS_REGION || 'us-east-1';
const QUEUE_URL = process.env.SQS_QUEUE_URL;

const sqsClient = new SQSClient({
  region: REGION,
  endpoint: process.env.LOCALSTACK_ENDPOINT || undefined,
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

app.post('/order', async (req, res) => {
  const { item, quantity } = req.body;

  if (!item || !quantity) {
    return res.status(400).json({ error: 'Missing item or quantity' });
  }

  const orderId = uuidv4();
  
  const orderData = {
    orderId,
    item,
    quantity,
    timestamp: new Date().toISOString(),
  };

  try {
    const command = new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(orderData),
    });

    await sqsClient.send(command);

    console.log(`[Producer] Order queued: ${orderId}`);
    
    return res.status(202).json({ 
      message: 'Order received', 
      orderId 
    });

  } catch (error) {
    console.error('[Producer] Error sending to SQS:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Producer API running on port ${PORT}`);
  console.log(`Targeting Queue: ${QUEUE_URL}`);
});