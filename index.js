const React = require("react");
const PropTypes = require("prop-types");
const ReactDom = require("react-dom");
const TestUtils = require("react-dom/test-utils");

class StatelessWrapper extends React.Component {
  render() {
    return this.props.children;
  }
}

StatelessWrapper.propTypes = {
  children: PropTypes.element.isRequired
};

function mount(component) {
  const rendered =
    TestUtils.renderIntoDocument(component) ||
    TestUtils.renderIntoDocument(
      React.createElement(StatelessWrapper, {}, component)
    );

  return ReactDom.findDOMNode(rendered);
}

module.exports = {
  mount
};
