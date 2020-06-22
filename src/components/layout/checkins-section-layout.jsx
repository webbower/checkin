import PropTypes from 'prop-types';
import Link from 'next/link';

import { Layout } from '.';
import { Heading } from '../heading';

const propTypes = {
  pageTitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const CheckinsSectionLayout = ({ pageTitle, children }) => {
  return (
    <Layout pageTitle={pageTitle}>
      <Heading level={2}>Checkins</Heading>

      <nav>
        <ul>
          <li>
            <Link href="/checkins/">
              <a>Checkins Home</a>
            </Link>
          </li>
          <li>
            <Link href="/checkins/new">
              <a>Checkin</a>
            </Link>
          </li>
        </ul>
      </nav>

      {children}
    </Layout>
  );
};

CheckinsSectionLayout.propTypes = propTypes;

export default CheckinsSectionLayout;
