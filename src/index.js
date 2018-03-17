import React, { Component } from "react";
import ReactDom from "react-dom";
import TestUtils from "react-dom/test-utils";

class StatelessWrapper extends Component {
  render() {
    return this.props.children; // eslint-disable-line react/prop-types
  }
}

export function mount(component) {
  const rendered =
    TestUtils.renderIntoDocument(component) ||
    TestUtils.renderIntoDocument(
      <StatelessWrapper>{component}</StatelessWrapper>
    );

  return ReactDom.findDOMNode(rendered);
}

export { Simulate } from "react-dom/test-utils";
