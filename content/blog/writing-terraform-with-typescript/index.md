---
title: Writing terraform with typescript
date: "2020-05-12T18:00:00.284Z"
description: Terraform for teams
draft: true
---

You may or may not have heard about the release of the [terraform cdk](https://github.com/hashicorp/terraform-cdk) (short for cloud development kit). It's HashiCorps answer to the aws cdk. In the words of the projects readme:

> CDK (Cloud Development Kit) for Terraform allows developers to use familiar programming languages to define cloud infrastructure and provision it through HashiCorp Terraform.

Let's try this out shall we?

## Deploying something with cdktf

Let's open our terminal and install install cdktf-cli:

```bash
npm install -g cdktf-cli
```

Next we'll initialize the project

```bash
mkdir hello-cdktf
cd hello-cdktf
cdktf init --template="typescript" --local
```
