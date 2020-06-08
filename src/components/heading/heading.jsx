import React from "react";
import PropTypes from "prop-types";

const headingElementMap = {
  "1": "h1",
  "2": "h2",
  "3": "h3",
  "4": "h4",
  "5": "h5",
  "6": "h6",
};

const propTypes = {
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
  children: PropTypes.node.isRequired,
};

const Heading = ({ level, children }) => {
  const Component = headingElementMap[level];
  return <Component>{children}</Component>;
};

Heading.propTypes = propTypes;

export default Heading;
