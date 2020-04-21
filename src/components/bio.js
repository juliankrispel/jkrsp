/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  const { author, social } = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(1),
      }}
    >
      <p>
        <strong>{author.name}</strong> {author.summary}
        {` `}
        <br />
        <small><a href={`https://twitter.com/${social.twitter}`}>
          Twitter
        </a>,{' '}
        <a href={`http://github.com/juliankrispel`}>
          Github
        </a>,{' '}
        <a href={`https://www.linkedin.com/in/julian-krispel-67487a1b/`}>
          LinkedIn
        </a></small>

      </p>
    </div>
  )
}

export default Bio
