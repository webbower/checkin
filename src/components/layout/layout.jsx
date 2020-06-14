import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';

const siteTitle = 'DevAnywhere.io Checkin app';

const propTypes = {
  pageTitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const Layout = ({ children, pageTitle }) => (
  <div className="container">
    <Head>
      <title>{[pageTitle, siteTitle].join(' | ')}</title>
      <meta name="description" content="Checkin app demo for DevAnywhere.io" />
      <meta name="og:title" content={siteTitle} />
    </Head>

    <header>
      <nav>
        <ul>
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li>
            <Link href="/users.html">
              <a>Users</a>
            </Link>
          </li>
          <li>
            <Link href="/teams.html">
              <a>Teams</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
    <main>{children}</main>
  </div>
);

Layout.propTypes = propTypes;

export default Layout;
export { siteTitle };
