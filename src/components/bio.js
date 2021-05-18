/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Cta from './Cta'
import { rhythm } from "../utils/typography"
import Logo from './logo'

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      email: file(absolutePath: { regex: "/email.png/" }) {
        childImageSharp {
          fluid(maxWidth: 400) {
            ...GatsbyImageSharpFluid
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
        marginBottom: rhythm(1),
      }}
    >
      <div>
        <p>
          I build <strong>text editing interfaces</strong> (like <a target="_blank" href="https://roamresearch.com/">Roam</a>,{' '}
          <a target="_blank" href="https://www.notion.so/">Notion</a>,{' '}
          <a target="_blank" href="https://docs.google.com/">Google Docs</a> or{' '}
          <a target="_blank" href="https://paper.dropbox.com/">Paper</a>).{' '}
        </p>
        <div className="email-action">
          <p>
            For enquiries, please book <Cta href="https://calendly.com/jkrsp/first-chat">a meeting</Cta> or email me and we'll take it from there:
            <br />
            <strong>julian [at] jkrsp [dot] com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Bio
