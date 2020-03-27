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
      "Version":"2012-10-17",
      "Statement":[{
      "Sid":"PublicReadGetObject",
            "Effect":"Allow",
        "Principal": "*",
          "Action":["s3:GetObject"],
          "Resource":["arn:aws:s3:::jkrsp.com/*"
          ]
        }
      ]
    }
  POLICY

  website {
    index_document = "index.html"
  }
}

resource "aws_s3_bucket_object" "example" {
  for_each = fileset(path.module, "public/**/*")

  bucket = aws_s3_bucket.b.id
  key    = replace(each.value, "public", "")
  source = each.value
}