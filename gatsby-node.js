const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const util = require('util')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          filter: { fields: { visible: { eq: true } } }
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = (props) => {
  const { node, actions, getNode } = props
  const { createNodeField } = actions
  console.log(props)
//  if (node != null) {
//    console.log(path.relative(process.cwd(), node.fileAbsolutePath))
//
//  }

  if (node.frontmatter != null) {
    const visible = !node.frontmatter.draft || process.env.NODE_ENV.toLowerCase() === 'development'

    createNodeField({
      name: `visible`,
      node,
      value: visible,
    })
  }

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
