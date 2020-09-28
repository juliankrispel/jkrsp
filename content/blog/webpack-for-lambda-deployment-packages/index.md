---
title: Writing AWS Lambda functions with Typescript and Webpack
date: "2020-09-28"
description: Writing AWS Lambda with Typescript and Webpack
image: webpack-and-typescript.png
draft: false
---

Whether you use terraform, the terraform cdk or the aws cdk, you still need to compile your source code and make them into lambda deployment packages. In this blogpost I go through how my setup for writing and compiling lambdas looks like.

![webpack](webpack-and-typescript.png) 

## What's a lambda deployment package

In case you're new to AWS Lambda here's a little primer. Lambda is the name of AWS's service for cloud functions, the basic building block of serverless applications. A lambda deployment package is a ZIP file that contains the source code for the lambda function. At it's most basic a deployment package has one file in it. This file will contain a handler. Regardless of which IAC tool you use you will need to define the name of the handler which consists of the filename (minus the file extension) and the handler function inside the file.

Say you have a file called `index.js` like this:

```js
exports.handler = async function(){
  return { hello: 'world' }
}
```

The handler of your lambda would be defined as `index.handler` `index` being the name of the file, `handler` being the name of the export in your javascript file.

If you zip this file, you have your lambda deployment package 🎉, it's that simple.

### Compiling with webpack

We're going to use webpack to compile our lambdas and bundle everything including modules into one compressed file.

I generally have a repository that has a `src` folder inside it and a `webpack.config.js` at its root. Rather than setting up separate folders with separate package.json's for separate lambda functions, they all go in my `src` folder. Now this doesn't work for every usecase. But mostly it is what I need because so that I can share libraries and utilities between my functions.

In my `webpack.config.js` I first look through my `src` directory and include every file that I want to compile to a lambda function. For my conventions this is typicall every file in the root directory `src` which has a `.ts`  (not a `d.ts`) extension.

```js
const entryDir = 'src'
const entry = readdirSync(dentryDir)
.filter(item => /\.ts$/.test(item))
.filter(item => !/\.d\.ts$/.test(item))
.reduce((acc, fileName) => ({
  ...acc,
  [fileName.replace(/\.(t|j)s$/, '')]: `./${entryDir}/${fileName}`
}), {})
```

I then pass these file paths to my webpack configuration as entry points and configure my webpack rules to compile typescript files with the typescript loader (`ts-loader`).
```js
module.exports = {
  entry,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  ...
}
```

Also very important is the that want to resolve all the dependencies we include from `node_modules`, that we set the compilation target to `node` (webpack can be used for browsers too) and that we set the compilation `mode` to `'production'` which will minify the output.

```js
  resolve: {
    modules: ['node_modules'],
    extensions: [ '.tsx', '.ts', '.js', '.json' ],
  },
  target: 'node',
  mode: 'production',
```

Finally, we can zip the files up with a simple bash script that I execute for each file in our destination folder, the default destination folder for webpack is `dist` so that's what I'm using here.

```js
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.done.tap(
          'ZipLambdaDeployment',
          (a,b,c) => {
            Object.keys(entry).forEach(name => {
              exec(`zip ${name}.zip ${name}.js`, { cwd: 'dist' })
            })
            exec(`rm *.js`, { cwd: 'dist' })
        });
      }
    }
  ]
```

That's it, [the entire gist for this webpack config is here](https://gist.github.com/juliankrispel/029ac27325488fde614b321972bd6525).