output "content_bucket" {
  value = aws_s3_bucket.content_bucket.bucket
}

output "distribution_id" {
  value = module.spa.distribution_id
}

output "domain_name" {
  value = "${var.domain_prefix}.${var.hosted_zone_name}"
}