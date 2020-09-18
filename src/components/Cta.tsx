
import React from 'react'

export default function Cta({ href, children, style = {} }) {
  return <a className="cta" href={href} style={style} target="_blank">{children}</a>
}