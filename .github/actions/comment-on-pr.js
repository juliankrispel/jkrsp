const { Octokit } = require("@octokit/core");
const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const fs = require('fs')
const ev = JSON.parse(
  fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
)
const subjectId = ev.pull_request.number

// See https://developer.github.com/v3/issues/#create-an-issue

const { repository } = await graphql(
  `
    mutation AddAComment {
      addComment(input: {
        body: $body,
        subjectId: $subjectId
      }) {
        clientMutationId
      }
    }
  `,
  {
    headers: {
      subjectId,
      body: 'Hello there',
      authorization: process.env.GITHUB_TOKEN
    }
  }
);

console.log("Commented on pr");

