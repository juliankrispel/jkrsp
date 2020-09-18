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
      <h3>👋 I'm Julian  </h3>
      <p>
        I design and build serverless applications for startups.<br/>
        ✔ <strong>Fixed price projects</strong> - Know the full cost upfront.<br/>
        ✔ <strong>Fast turnaround times</strong> - Get a prototype within weeks.<br/>
        ✔ <strong>100% Serverless</strong> - Own a low cost system that scales with your business.<br/>
        ✔ <strong>Complete Service</strong> - From Frontend to Devops.<br/>
      </p>
      <p>Want to talk about a project? <Cta href="https://calendly.com/jkrsp/initial-consultation">Book a 30m chat</Cta> or fill out <Cta style={{transform: 'rotate(-2deg)'}} href="https://julian112414.typeform.com/to/uCNe00jk">the project form</Cta> and I'll get back to you</p>
    </div>
  )
}

export default Bio
