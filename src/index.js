import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDom from "react-dom";
import TestUtils from "react-dom/test-utils";

class StatelessWrapper extends Component {
  render() {
    return this.props.children;
  }
}

StatelessWrapper.propTypes = {
  children: PropTypes.element.isRequired
};

export function mount(component) {
  const rendered =
    TestUtils.renderIntoDocument(component) ||
    TestUtils.renderIntoDocument(
      <StatelessWrapper>{component}</StatelessWrapper>
    );

  return ReactDom.findDOMNode(rendered);
}

export { Simulate } from "react-dom/test-utils";
