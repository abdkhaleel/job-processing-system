variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "sre-order-system"
}

variable "env" {
  description = "Environment (dev, prod, local)"
  type        = string
  default     = "local"
}