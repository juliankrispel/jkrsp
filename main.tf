provider "aws" {
  region = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket = "jkrsp-tf-state"
    region = "eu-west-2"
  }
}

variable "env_prefix" { }
variable "is_temp_env" {
  default = false
}

resource "aws_s3_bucket" "b" {
  bucket = "${var.env_prefix}jkrsp.com"
  force_destroy = var.is_temp_env

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_s3_bucket_website_configuration" "b" {
  bucket = aws_s3_bucket.b.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "b" {
  bucket = aws_s3_bucket.b.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "b" {
  depends_on = [aws_s3_bucket_public_access_block.b]
  
  bucket = aws_s3_bucket.b.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "arn:aws:s3:::${var.env_prefix}jkrsp.com/*"
      }
    ]
  })
}

output "website" {
  value = "http://${aws_s3_bucket.b.bucket_regional_domain_name}"
}