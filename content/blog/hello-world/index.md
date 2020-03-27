---
title: A blog on gatsby, s3, terraform and github actions 
date: "2020-03-28T10:00:00.284Z"
description: A gatsby blog on s3, deployed with terraform and github actions.
---

I've been using terraform at work a lot, to build serverless services on aws. It makes building services on AWS a lot easier. So I'll start my new blog by showing how few steps it takes to deploy host this blog on s3 and automate deployment via github actions and terraform.

## Prerequisites

### Create an AWS account

Go to [https://aws.amazon.com/](https://aws.amazon.com/) and create an account

### Create an s3 bucket for your terraform state

You'll need this so that terraform can persist state between runs

### Create a repository with your gatsby site in it

To set up a gatsby blog you need to first install gatsby, then install the blog starter:

```
npm install -g gatsby
gatsby new gatsby-starter-blog https://github.com/gatsbyjs/gatsby-starter-blog
```

### Create an IAM user for your github actions 

### Add the IAM users credentials to your github secrets

### Build your gatsby site in a github action

### Deploy your aws s3 bucket and all objects via terraform


So with github actions I want to automate two things:

1. Build the gatsby site
2. Configure an s3 bucket and deploy our gatsby build to it

### Remote state



