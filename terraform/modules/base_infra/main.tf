data "aws_caller_identity" "current" {}

locals {
  name_prefix = "${var.target_env}-vitereactspa-${var.app_env}"
}

resource "aws_s3_bucket" "content_bucket" {
  bucket = local.name_prefix
}

module "spa" {
  source = "git@github.com:3clife-org/aws.module.cloudfront-distro.git?ref=v0.2.0"
  domain_prefix = var.domain_prefix
  hosted_zone_name = var.hosted_zone_name
  s3_bucket_regional_domain_name = aws_s3_bucket.content_bucket.bucket_regional_domain_name
  s3_bucket_name = aws_s3_bucket.content_bucket.bucket_domain_name
}


resource "aws_s3_bucket_policy" "content_bucket_policy" {
  bucket = aws_s3_bucket.content_bucket.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid: "AllowCloudFrontServicePrincipal",
        Effect: "Allow",
        Principal: {
          Service: "cloudfront.amazonaws.com"
        },
        Action: "s3:GetObject",
        Resource = "arn:aws:s3:::${aws_s3_bucket.content_bucket.bucket}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${module.spa.distribution_id}"
          }
        }
      }
    ]
  })
}