---
title: Terraform as a boundary between teams
date: "2020-05-12T18:00:00.284Z"
description: Terraform for teams
draft: true
---

In an ideal world, here's what I'd like to see for the different projects at my company:

```
module "lambda_endpoint" {
  source = "my-org/lambda_endpoint"
  name = ""
}
```