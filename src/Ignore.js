import React, { Component } from "react";
import ReactDOM from "react-dom";

export default class Ignore extends Component {
  componentDidMount() {
    let el = ReactDOM.findDOMNode(this);
    ReactDOM.unmountComponentAtNode(el);
    el.outerHTML = "<!-- ignore -->";
  }

  render() {
    return <div />;
  }
}
