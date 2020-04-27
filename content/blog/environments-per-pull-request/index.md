---
title: Per Pull Request Environments with Github Actions and Terraform
date: "2020-04-28T10:00:00.284Z"
description: Using github-actions and terraform - this post will guide you through how to manage the lifecycle of short lived environments.
draft: true
---

Using [Github Actions](https://github.com/features/actions) and [terraform](https://www.terraform.io/) - this post will guide you through automating the lifecycle of per pull request environments on github.

As a sidenote, short-lived environments go by many names, some of these are: feature environments, ephemeral environments, [review apps](https://devcenter.heroku.com/articles/github-integration-review-apps), on demand environments or temporary environments.

### What are short lived environments?

Say you're on a team that works on multiple features simultaneously. There is a need to share the work with colleagues in Engineering, Product, Design or QA to collaborate, test and review. That's where short lived environments come in. Their existence is tied to the lifetime of the project itself.

### Why Infrastructure as Code?

Although terraform is my weapon of choice (material for an entirely new blogpost 😅), there are plenty other tools out there (such as [pulumi](https://www.pulumi.com/) or [cloudformation](https://aws.amazon.com/cloudformation/) 😬if you're buildin only on AWS).

The fact of the matter is - you should use IAC tools to maintain your sanity and this is especially true when it comes to managing short lived environments.

Although in this tutorial I am just provisioning an S3 bucket with terraform (for my blog), the same concepts can easily be mapped to any kind of resources, anything infrastructure that terraform (or your fav IAC tool) has modules for.

### Github actions to control the lifecycle of short lived environments.

We'll create 3 github actions as part of this tutorial to manage our environments. Github actions are basically `yml` files that are located in `.github/workflows/`

1. `create_pr_env.yml` - The lifecycle of a feature starts when pull request is opened. This is when we want to create our short lived environment.
2. `update_pr_env.yml` - When the pull request is updated, we want to update the environment to reflect the changes made.
3. `destroy_pr_env.yml` - When the pull request is closed, we need to destroy the environment to make sure we're not wasting resources (if we don't our AWS bill would likely explode)

