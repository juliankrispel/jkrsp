---
title: Automating continuous deployment and rollback with Github releases and actions
date: "2020-06-22T13:00:00.284Z"
description: Automating continuous deployment and rollback with Github releases and actions
draft: false
---

I've been using Github Releases a lot lately - to manage CI and CD. [Github lets you create a release just by using the UI](https://help.github.com/en/github/administering-a-repository/managing-releases-in-a-repository). You can also create a release by [using an action](https://github.com/actions/create-release) or [via the api](https://developer.github.com/v3/repos/releases/#create-a-release).

When a release is created for an application, I usually want to deploy this release. This is a common usecase for github actions and looks something like this:

```yml
on: 
  release:
    types: [published]

name: Deploy
jobs:
  deploy_release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Install deps
        run: yarn
      - name: Build
        run: yarn build
      - name: Deploy
        run: ./deploy.sh
```

However what if we released something that broke our app and wasn't caught by tests or review - We'll need to roll back. The most common pattern I see software teams use for rolling back a change is to revert the commit(s) which often results in confusion. You know what I'm talking about if you've ever seen a `Revert the revert` pull request. It becomes even more fun when the revert of the revert gets reverted again.

Anyway, rather than reverting a commit to roll back a release, what we'll do is delete a release. This is something that Github also lets you do via it's UI or API. Our github action can trigger when a release is deleted and instead of just deploying the commit referenced in the event, we can use an action to [fetch the latest release](https://github.com/marketplace/actions/fetch-latest-release). With some modifications, we can update the above action to do both rollback and deploy for us in one go.


```yml
on: 
  release:
    types: [published, deleted]
```
First we update the event to trigger for both `published` and `deleted` events.

```yml
name: Deploy or Rollback
jobs:
  deploy_release:
    runs-on: ubuntu-latest

    steps:
      - id: latest
        uses: thebritican/fetch-latest-release@v1.0.3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```
Then we use an action to fetch the latest release, I'm using [thebritican/fetch-latest-release@v1.0.3](https://github.com/marketplace/actions/fetch-latest-release) . Note that we need to pass `github_token` in order for this to work and assign an id.

```yml

      - uses: actions/checkout@v2
        with: 
          ref: ${{ steps.latest.outputs.tag_name }}
```
Next we reference the output of our `latest` step with our `checkout` action, so we checkout the code for the right tag.

```yml

      - name: Install deps
        run: yarn

      - name: Build
        run: yarn build

      - name: Deploy
        run: ./deploy.sh
```

Then we build and deploy as we did before.

Now you have a simple github acitons based work-flow for deploying and rolling back releases. For reference, here's the entire workflow


```yml
name: Deploy or Rollback
jobs:
  deploy_release:
    runs-on: ubuntu-latest

    steps:
      - id: latest
        uses: thebritican/fetch-latest-release@v1.0.3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/checkout@v2
        with: 
          ref: ${{ steps.latest.outputs.tag_name }}

      - name: Install deps
        run: yarn

      - name: Build
        run: yarn build

      - name: Deploy
        run: ./deploy.sh
```

Bear in mind that this project is using yarn for package management, however you can replace those with a package manager/language of your choice, the concept remains the same.
