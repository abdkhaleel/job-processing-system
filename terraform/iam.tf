
resource "aws_iam_policy" "api_policy" {
  name        = "${var.project_name}-api-policy-${var.env}"
  description = "Allow API to send messages to SQS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.order_queue.arn
      }
    ]
  })
}

resource "aws_iam_policy" "worker_policy" {
  name        = "${var.project_name}-worker-policy-${var.env}"
  description = "Allow Worker to read SQS and write to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.order_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.orders_table.arn
      }
    ]
  })
}