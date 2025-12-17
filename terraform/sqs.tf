resource "aws_sqs_queue" "order_dlq" {
  name                      = "${var.project_name}-dlq-${var.env}"
  message_retention_seconds = 1209600 
}

resource "aws_sqs_queue" "order_queue" {
  name                      = "${var.project_name}-main-${var.env}"
  message_retention_seconds = 86400   
  visibility_timeout_seconds = 30    

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.order_dlq.arn
    maxReceiveCount     = 3
  })
}

output "sqs_queue_url" {
  value = aws_sqs_queue.order_queue.id
}