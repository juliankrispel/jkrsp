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
        borderBottom: '1px solid #ccc',
        marginBottom: rhythm(1),
      }}
    >
      <div>
        <h3>👋 I'm Julian  </h3>
        <p>
          I build <strong>serverless applications on AWS</strong> to help businesses succeed. <br />Fill out <Cta href="https://julian112414.typeform.com/to/uCNe00jk">the project form</Cta> or <Cta href="https://calendly.com/jkrsp/initial-consultation">book a 30m chat</Cta> if you'd like to talk about a project.
        </p>
      </div>
    </div>
  )
}

export default Bio
