---
title: How to build a full stack serverless app with Terraform, Appsync and React
date: "2020-08-21:00:00.284Z"
description: How to build a full stack serverless app with Terraform, Appsync and React
draft: true
---


I want to build an app complete with authentication and API. I have the following constraints:

- I need to be able to use google oauth (AWS calls this federated authentication)
- I want to use terraform to manage the infrastructure


Steps to take to build this:

1. Create Cognito user pool with google federation

Here's the default [example on the terraform docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_identity_provider)

```
resource "aws_cognito_user_pool" "example" {
  name                     = "example-pool"
  auto_verified_attributes = ["email"]
}

resource "aws_cognito_identity_provider" "example_provider" {
  user_pool_id  = aws_cognito_user_pool.example.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email"
    client_id        = "your client_id"
    client_secret    = "your client_secret"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}
```

add that to `main.tf` for a start

2. Add a frontend

First let's create a folder for the app to live in. I'm going to use react for this but really you could use anything. I also prefer typescript so here you go:

```
yarn create react-app app --template typescript
```

Now let's cd into our app folder and install the `amazon-cognito-identity-js` module to authenticate via cognito.

```sh
cd app 
yarn add amazon-cognito-identity-js
```







