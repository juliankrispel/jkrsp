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

  console.log(data)
  const { author, social } = data.site.siteMetadata
  return (
    <div
      style={{
        marginBottom: rhythm(1),
      }}
    >
      <div>
        <p>
          I build <strong>text editors with react</strong> and <strong>full-stack serverless applications on AWS</strong>.
        </p>
        <div className="email-action">
          <p>
            Got a project? <Cta href="https://calendly.com/jkrsp/first-chat">Book a meeting</Cta> or email me and we'll take it from there
          </p>
          <img className="email-img" src={data.email.childImageSharp.fluid.src} />
        </div>
      </div>
    </div>
  )
}

export default Bio
