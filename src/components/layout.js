import React from "react"
import { Link } from "gatsby"
import { ThemeToggler } from 'gatsby-plugin-dark-mode'

import { rhythm, scale } from "../utils/typography"
import '../styles/global.css'
import Logo from './logo'

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1>
        <Link
          to={`/`}
        >
          <Logo />
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3>
        <Link
          to={`/`}
        >
          <Logo />
        </Link>
      </h3>
    )
  }
  return (
    <div
      style={{
        color: 'var(--textNormal)',
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(27),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <ThemeToggler>
        {({ theme, toggleTheme }) => (
          <label className="light-switch">
            <input
              type="checkbox"
              onChange={e => toggleTheme(e.target.checked ? 'dark' : 'light')}
              checked={theme === 'dark'}
            />{' '}
            {theme === 'dark' ? '🌙' : '☀' }
          </label>
        )}
      </ThemeToggler>

      <header>{header}</header>
      <main>
        {children}
      </main>
      <footer>
      <br />
      <small><a href={`https://twitter.com/juliandoesstuff`}>
        Twitter
      </a>,{' '}
      <a href={`http://github.com/juliankrispel`}>
        Github
      </a>,{' '}
      <a href={`https://www.linkedin.com/in/julian-krispel-67487a1b/`}>
        LinkedIn
      </a>, <a href="/rss.xml">
        RSS
      </a></small>
      </footer>
    </div>
  )
}

export default Layout
