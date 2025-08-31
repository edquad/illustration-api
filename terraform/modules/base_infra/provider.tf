terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }

  backend "s3" {}
}

locals {
  default_tags = merge(var.tags, {
    Name = local.name_prefix,
    Environment = var.target_env,
  })
}


provider "aws" {
  region = var.target_region
  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  alias = "us_east_1"
  region = "us-east-1"
}
