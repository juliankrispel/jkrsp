provider "aws" {
  region = "eu-west-2"
}

terraform {
  backend "s3" {
    bucket = "jkrsp-tf-state"
    key    = "jkrsp.com.tfstate"
    region = "eu-west-2"
  }
}

resource "aws_s3_bucket" "b" {
  bucket = "jkrsp.com"
  acl    = "public-read"

  policy = <<POLICY
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::jkrsp.com/*"
        }
      ]
    }
  POLICY

  website {
    index_document = "index.html"
  }

  tags = {
    ManagedBy = "terraform"
  }
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "jkrsp.com"
  validation_method = "DNS"

  tags = {
    ManagedBy = "terraform"
  }

  lifecycle {
    create_before_destroy = true
  }
}