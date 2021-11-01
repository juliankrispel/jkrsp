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
      <div>
        <div>
          <p>
            <small>Some awesome companies I've worked with</small>
          </p>
          <a title="Attio" href="https://attio.com/">
            <img alt="Attio" className="client-logo" src="clients/attio.png" />
          </a>
          <a title="Aula Education" href="https://aula.education/">
            <img
              alt="Aula Education"
              className="client-logo"
              src="clients/aula.png"
            />
          </a>
          <a tettra="Spectrum" href="https://spectrum.chat/">
            <img
              alt="Spectrum"
              className="client-logo"
              src="clients/spectrum.jpg"
            />
          </a>
          <a title="Tettra" href="https://tettra.com/">
            <img
              alt="Tettra"
              className="client-logo"
              src="clients/tettra.jpg"
            />
          </a>
          <a title="Broadcast" href="https://withbroadcast.com/">
            <img
              alt="Broadcast"
              className="client-logo"
              src="clients/broadcast.png"
            />
          </a>
          <p>
            <small>Things people say about working with me</small>
          </p>

          <blockquote class="twitter-tweet">
            <p lang="en" dir="ltr">
              Can vouch for Julian, he did fantastic work for us at Spectrum!
              Very few people know more about rich text editors.
            </p>
            &mdash; Max Stoiber (@mxstbr){" "}
            <a href="https://twitter.com/mxstbr/status/1420499475739590656?ref_src=twsrc%5Etfw">
              July 28, 2021
            </a>
          </blockquote>{" "}
          <blockquote class="twitter-tweet">
            <p lang="en" dir="ltr">
              It&#39;s{" "}
              <a href="https://twitter.com/_jkrsp?ref_src=twsrc%5Etfw">
                @_jkrsp
              </a>
              &#39;s last week{" "}
              <a href="https://twitter.com/aula_education?ref_src=twsrc%5Etfw">
                @aula_education
              </a>{" "}
              after working with us architecting and building our brand new
              content editor for 9 months
              <br />
              <br />
              💜He has been fundamental to us being able to deliver an editor
              that is performant, accessible, well tested, easy to extend and
              feels great to use.
            </p>
            &mdash; David Saltares (@d_saltares){" "}
            <a href="https://twitter.com/d_saltares/status/1442458402270023683?ref_src=twsrc%5Etfw">
              September 27, 2021
            </a>
          </blockquote>
          <script
            async
            src="https://platform.twitter.com/widgets.js"
            charset="utf-8"
          ></script>
          <br />
          <br />
        </div>
      </div>
    </div>
  )
}

export default Bio
