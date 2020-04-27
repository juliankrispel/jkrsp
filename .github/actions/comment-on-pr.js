const { Octokit } = require("@octokit/core");
const { graphql } = new Octokit();
const fs = require('fs')
const ev = JSON.parse(
  fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
)
const subjectId = ev.pull_request.number

// See https://developer.github.com/v3/issues/#create-an-issue
graphql(
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
    subjectId,
    body: 'Hello there',
    headers: {
<<<<<<< Updated upstream
      subjectId,
      body: 'Hello there',
      authorization: `token ${process.env.GITHUB_TOKEN}`
=======
      authorization: process.env.GITHUB_TOKEN
>>>>>>> Stashed changes
    }
  }
).then(({ repository }) => {
  console.log("Commented on pr");
});


