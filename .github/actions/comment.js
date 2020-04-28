console.log('hello');

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set myToken with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }}
  // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
  const { issue_number, github_token } = process.env

  const octokit = new github.GitHub(github_token);

  const { data } = await octokit.issues.createComment({
      issue_number,
      body: "hello"
  });

  console.log(data);
}

run();