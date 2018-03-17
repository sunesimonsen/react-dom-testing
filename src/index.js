import React, { Component } from "react";
import ReactDom from "react-dom";
import TestUtils from "react-dom/test-utils";

export function mount(element) {
  const div = document.createElement('div');
  ReactDom.render(element, div);
  return div.firstChild;
}

export { Simulate } from "react-dom/test-utils";
