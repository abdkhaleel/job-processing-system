resource "aws_dynamodb_table" "orders_table" {
  name         = "Orders-${var.env}"
  billing_mode = "PAY_PER_REQUEST" 
  hash_key     = "order_id"       

  attribute {
    name = "order_id"
    type = "S" 
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.env
    Project     = var.project_name
  }
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.orders_table.name
}