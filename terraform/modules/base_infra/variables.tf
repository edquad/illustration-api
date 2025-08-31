variable "target_account" {
  description = "The AWS account to deploy resources in"
  type        = string
}

variable "target_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "target_env" {
  description = "Name of the environment to deploy to"
  type = string
}

variable "app_env" {
  description = "Name of the application environment to deploy to"
  type = string  
}

variable "domain_prefix" {
  description = "The prefix of the API Gateway custom domain"
  type        = string
}

variable "hosted_zone_name" {
  description = "The Route 53 hosted zone name for the custom domain"
  type        = string
}

variable "subject_alternative_hosted_zones" {
  description = "The Route 53 hosted zones for the subject alternative names"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "A map of tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "tf_state_bucket" {
  description = "The name of the S3 bucket for Terraform state"
  type        = string
}

variable "tf_state_project_key" {
  description = "The base path for the Terraform state file for the project."
  type        = string
}
