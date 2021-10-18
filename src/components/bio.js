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

  return (
    <div
      style={{
        marginBottom: rhythm(1),
      }}
    >
      <div>
        <p>
          I help software teams build{" "}
          <strong>text based editing interfaces</strong>
        </p>
        <div className="email-action">
          <p>
            For enquiries,{" "}
            <Cta href="https://calendly.com/jkrsp/office">
              please book something on my calendar
            </Cta>
            .
            <br />
            Or email me at <strong>julian [at] jkrsp [dot] com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Bio
