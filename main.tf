provider "aws" {
  region = "eu-west-2"
}

resource "aws_s3_bucket" "b" {
  bucket = "jkrsp.com"
  acl    = "public-read"

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