---
title: A blog on gatsby, s3, terraform and github actions 
date: "2020-03-28T10:00:00.284Z"
description: A tutorial on how I put my new blog on the internet, using gatsby, s3, github actions and terraform.
---

I've been using terraform at work a lot, to build serverless things on aws. It makes building  managing infrastructure a lot easier. I'll start my new blog with a quick tutorial on what I did. Bear in mind - this isn't really the easiest way to create a blog 😅- AWS can be a bit wieldy - but it may be useful to anyone who wants to host static websites on S3.

__tldr;__ - The outcome of this tutorial is this blog - [the code of which is hosted on github](github.com/juliankrispel/jkrsp)

### Create an AWS account and install the aws cli

If you don't already have one, go to [https://aws.amazon.com/](https://aws.amazon.com/) and create an account. Install the [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

If you're on a mac like me you can just use the [homebrew package](https://formulae.brew.sh/formula/awscli):

`brew install awscli`

Also don't forget to add your aws credentials to `~/.aws/credentials` and the aws config to `~/.aws/config`, [instructions here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

### Create an s3 bucket for your terraform state

You'll need this so that terraform can persist state between runs. You can create the bucket by logging into aws or by runnning:

```
aws s3api create-bucket --bucket my-terraform-state-bucket
```

The region will default to your region set in your aws config unless you pass the `--region` argument

### Create a repository with your gatsby site in it

First go to github and create a repository for your your blog.

Next, to set up a gatsby blog you need to first install gatsby, then install the blog starter:

```
npm install -g gatsby
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog
```

Don't forget to add your github repo to your local gatsby repo.

```bash
cd my-blog
git remote add origin <my-github-repo-url>
git push origin master # might as well push it
```

### Create an IAM user for your github actions 

You'll need an IAM user that has permissions to sync your gatsby build to s3. For this I find it easiest to use the [aws console](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).

Here's what you need to do:

1. Log in to the console.
2. Go to Services > IAM > Users
3. Click on Add User
4. Fill in a user name
5. Select "Programmatic Access" and click on __Next: Permissions__
6. Click on "Attach existing policies directly"
7. Search for __s3__ and choose __AmazonS3FullAccess__, this will give the user read and write permissions for anything on s3, you might want to reduce access to the specific resources you need at some point.
8. Click on __Next: Tags__ - tag it if you like I usually just use tags for automatically created resources.
9. Click on __Next: Review__ and then __Create user__
10. Now copy the __Access Key ID__ and the __Secret access key__ and put them in a text file, or just leave the tab open while you navigate to github.
11. Now navigate the browser to your github repo, click on Settings > Secrets > Add new Secret
12. Add both secrets: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to your github secrets, use the secrets that you copied from aws.

### Build and deploy your gatsby site in a github action

So far so good. Now lets add our github action. You need to create a file at `.github/workflows/my-action.yml`

`my-action` can be anything you like really, in my case I'll call it `deploy.yml`, fittingly.

The content for now will look like this

```yml
## We only want to deploy when a commit has landed in master
on:
  push:
    branches:
      - master
name: Build Gatsby Site
jobs:
  deploy:
    runs-on: ubuntu-latest
    # Here are the AWS secrets that we just added to
    # our github repo
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    steps:
    # This github actions checks out the code of our repo
    # so that the files are available to the action
    - name: Checkout
      uses: actions/checkout@v1
    # I'm using yarn because I like yarn :), but you can use npm just as well
    - name: Install Dependencies
      run: yarn
    # As simple as that, we just use our normal package.json script
    # to build the site
    - name: Build Site
      run: yarn build
    # Here we run terraform init
    - name: 'Terraform Init'
      uses: hashicorp/terraform-github-actions@master
      with:
        tf_actions_version: 0.12.13
        tf_actions_subcommand: 'init'
    # Here we run terraform plan
    - name: 'Terraform Plan'
      uses: hashicorp/terraform-github-actions@master
      with:
        tf_actions_version: 0.12.13
        tf_actions_subcommand: 'plan'
    # And terraform apply to configure our s3 resources
    - name: 'Terraform Apply'
      uses: hashicorp/terraform-github-actions@master
      with:
        tf_actions_version: 0.12.13
        tf_actions_subcommand: 'apply'
    # Finally, this is how we upload our build to our bucket
    - uses: chrislennon/action-aws-cli@v1.1
    - name: sync to s3
      run: aws s3 sync public s3://jkrsp.com
```

### Write your terraform

So we've got our github actions, now let's write our terraform config. If you haven't written any terraform before, don't worry it's pretty straight forward and pretty self explanatory.

I'll explain with inline comments:

```terraform
# This just sets the aws provider default region to us-east-1
provider "aws" {
  region = "us-east-1"
}

# This defines how our terraform state is stored. Terraform state
# is a json file that tracks the identifiers and state of our resources
# this enables terraform to perform state transitions and only change resources
# which have actually changed. To run terraform apply - we need state.
terraform {
  backend "s3" {
    bucket = "my-terraform-state-bucket"
    key    = "my-blog.com.tfstate"
    region = "us-east-1"
  }
}

# Here's our bucket configuration. Pretty simple really
# It has a name, an acl of "public-read", a public bucket policy
# and a website configuration.
resource "aws_s3_bucket" "b" {
  bucket = "my-blog.com"
  acl    = "public-read"

  policy = <<POLICY
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "PublicReadGetObject",
          "Effect": "Allow",
          "Principal": "*",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::jkrsp.com/*"
        }
      ]
    }
  POLICY

  website {
    index_document = "index.html"
  }
}
```

Save the above in a file called `main.tf`, commit your changes and push to your repository.

And Voila, you have a static website on a bucket.