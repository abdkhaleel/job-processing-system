resource "aws_sns_topic" "alerts" {
  name = "sre-critical-alerts-${var.env}"
}

resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "oncall-sre@example.com" # Fake email
}