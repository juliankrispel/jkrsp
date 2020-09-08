---
title: Automating browser tests with jest, github actions and puppeteer
date: "2020-09-08T12:00:00.284Z"
description: Automating browser tests with jest, github actions and puppeteer
draft: false
---

In this tutorial I'll show you how to add automated browser testing to your workflow within minutes. Step by step, using github actions, jest and puppeteer. In this case we'll be testing a react app but that you can easily adjust the steps to use any other kind of frontend framework (or none at all).

## Why automated browser testing?
I think it's reasonable to ask yourself this question: Do you really need to write and maintain automated browser tests? Although the open source tools have matured over the last decade it is still a significant burden on any engineering team to do this well - hence why there is an army of QA Engineers and SaaS products out there. I won't go into depth here but think about the tradeoffs and whether this investment is worth it. 

In my case I wouldn't know what to do without automated browser tests. I write a lot of editor software and they are generally quite hard to get right and very easy to break unintentionally. Browser automation gives me and the teams I work with/for the confidence that new changes won't set the entire user experience on fire, hence it is a tool I often reach for.

## Why github actions?
It's by far the quickest and easiest way to add automation to developer workflows, whether that is for myself or for a client. I swear by github actions - in case you couldn't tell from my other blogposts.

## Why puppeteer?
Because it's a popular and familiar tool for automated browser testing. It also integrates with firefox which is neat and for my requirements I rarely have to go full on selenium - which integrates with pretty much everything but comes with a horrible developer experience.

## Why jest?
If you (like me) are already working with react apps and would like to test with a familiar, battle-tested test runner - jest is pretty great.

### Step 1 - Create a react app.

```
npx create-react-app my-app --template
```

I use a fair bit of typescript so that is my default option.

### Step 2 - Install jest, puppeteer and jest-puppeteer

```
npm install --save-dev jest-puppeteer jest puppeteer
```

### Step 3 - Add jest-puppeteer.config.js

```js
// jest-puppeteer.config.js
module.exports = {
  launch: {
    dumpio: true,
    headless: true
  },
  browser: 'chromium',
  browserContext: 'default',
  server: {
    command: `npm start`,
    port: 3000,
    launchTimeout: 10000,
    debug: true,
  },
}
```

This will tell jest-puppeteer to run the `start` script before launching the tests (which is configured to run the `react-scripts` dev server)

You can update this to instead run firefox. For more info please check the [jest-puppeteer readme](https://github.com/smooth-code/jest-puppeteer/)

### Step 4 - Add a jest config for the browser tests

```
// jest-integration.config.js
module.exports = {
  preset: 'jest-puppeteer',
  rootDir: 'integration',
  testRegex: './*\\.test\\.(js|tsx?)$',
}
```

Now add a script to your package.json like this:

```
"test:integration": "jest -c jest-integration.config.js"
```

This will use the config file for integration tests.

### Step 5 - Add a separate folder for browser tests with a test

I like to keep them separate, makes it easier to locate them. Also they will have to be run with the separate configuration, hence add a folder called `integration` or any other name you prefer.

Then add a test to that folder:

```js
// my-test.js
describe('React App', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000')
  })

  it('should display a react logo', async () => {
    await expect(page).toMatch('React')
  })
})
```

Now give your script a try. Running `test:integration` should run the test(s) (which should pass).

### Step 6 - Add a github action to run these 

Add the following action at `.github/workflows/integration-tests.yml

```yml
name: Automated browser tests
on: push
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
```

This doesn't do anything atm other than checking out the repository.

Next we want to install the dependencies. I'm using yarn in this instance but you could use npm as well

```yml
      - name: Install deps
        run: yarn
```

Once the steps are installed you could just run the test script

```yml
      - name: Run tests
        run: yarn test:integration
```

And that would be it. Push this to your repository and you'll see the browser tests are running in your github action. Here's the github action in full, I've added a caching step because chromium is quite a big dependency and I want my action to run as quickly as possible:

```yml
name: Automated browser tests
on: push
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@master

      - name: Get yarn cache directory path
        id: yarn-cache-dir-path
        run: echo "::set-output name=dir::$(yarn cache dir)"

      - uses: actions/cache@v2
        id: yarn-cache
        with:
          path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-

      - name: Install deps
        run: yarn

      - name: Run tests
        run: yarn test:integration
```

Here's [a repository on github with the final product of this tutorial](https://github.com/juliankrispel/jest-puppeteer-github-action-tests) - could be used as a starter if you don't want to go through these steps manually and need something quick.

Finally, once you have a substantial browser test suite you might need to add `--runInBand` - which prevents jest running these tests in parallel which is sometimes needed to spare resources on the machine you're running the tests on.