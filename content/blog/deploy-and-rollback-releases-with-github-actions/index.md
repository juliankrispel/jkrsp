---
title: Rolling back releases with github actions
date: "2020-05-12T18:00:00.284Z"
description: Deployment and rollback with github actions
draft: true
---

What if 

We're going to do this as simple as possible so here it is.

When a release gets created - we deploy it - to production

When a release gets deleted - we roll back to the previous release

So here you go - two workflows. First:

## Deployment Workflow `deploy.yml`

## Rollback Workflow `rollback.yml`

