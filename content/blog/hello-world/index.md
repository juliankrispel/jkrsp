---
title: A blog on gatsby, s3, terraform and github actions 
date: "2020-03-28T10:00:00.284Z"
description: A gatsby blog on s3, deployed with terraform and github actions.
---

I've been using terraform at work a lot, to build serverless services on aws. It makes building services on AWS a lot easier. So I'll start my new blog by showing how few steps it takes to deploy host this blog on s3 and automate deployment via github actions and terraform.

First I'll create a gatsby blog, [I've followed the steps here](https://www.gatsbyjs.org/starters/gatsbyjs/gatsby-starter-blog/)

To set up a gatsby blog you need to first install gatsby, then install the blog starter:

```
npm install -g gatsby
gatsby new gatsby-starter-blog https://github.com/gatsbyjs/gatsby-starter-blog
```

So with github actions I want to automate two things:

1. Build the gatsby site
2. Configure an s3 bucket and deploy our gatsby build to it


