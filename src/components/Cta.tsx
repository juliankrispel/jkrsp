
import React from 'react'

export default function Cta({ href, children }) {
  return <a className="cta" href={href} target="_blank">{children}</a>
}