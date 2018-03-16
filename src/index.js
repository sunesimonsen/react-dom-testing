import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDom from "react-dom";
import TestUtils from "react-dom/test-utils";

export function mount(element) {
  const div = document.createElement('div');
  ReactDOM.render(element, div);
  return div;
}

export { Simulate } from "react-dom/test-utils";
