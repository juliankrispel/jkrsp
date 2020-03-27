provider "aws" {
  region = "eu-west-2"
  profile = ""
}

resource "aws_s3_bucket" "b" {
  bucket = "jkrsp.com"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_bucket_object" "example" {
  for_each = fileset(path.module, "public/**/*")

  bucket = aws_s3_bucket.example.id
  key    = replace(each.value, "my-dir", "base_s3_key")
  source = each.value
}