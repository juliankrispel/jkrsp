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
        <p>
          I build <strong>full-stack serverless applications on AWS</strong> for businesses and start-ups.
          <br />Want to talk shop? Fill out <Cta href="https://julian112414.typeform.com/to/uCNe00jk">the questionaire</Cta> or <Cta href="https://calendly.com/jkrsp/initial-consultation">book a slot</Cta> and I'll get back to you.
        </p>
      </div>
    </div>
  )
}

export default Bio
