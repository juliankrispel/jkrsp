---
title: How to use deno on aws lambda with terraform
date: "2020-05-12T18:00:00.284Z"
description: Using deno on AWS lambda
draft: true
---

About 10 days ago the first preview of deno 1.0 [has been released](https://github.com/denoland/deno/releases/tag/v1.0.0-rc1). Deno is Ryan Dahl's effort to address all the regrets he has with node.js, [see the jsconf talk here](https://www.youtube.com/watch?v=M3BM9TB-8yA).

Deno is a really great candidate for serverless compute - [it's fast](https://deno.land/benchmarks), uses typescript and is easy to use - small standard lib, promise support out of the box etc.

## Using the deno lambda runtime