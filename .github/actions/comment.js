const github = require('@actions/github');

async function run() {
  const { issue_number, github_token, owner, repo, website_link } = process.env

  const octokit = new github.GitHub(github_token);

  try {
    const { data } = await octokit.issues.createComment({
      owner,
      repo,
      issue_number,
      body: `[Review website here](${website_link.replace(/"/gs, '')})`
    });

  } catch (err) {
    throw err
  }
}

run();
