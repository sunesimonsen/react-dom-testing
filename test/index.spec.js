const React = require("react");
const PropTypes = require("prop-types");
const unexpected = require("unexpected");

const expect = unexpected.clone().use(require("unexpected-dom"));

const { mount } = require("..");

class Hello extends React.Component {
  render() {
    const { children, ...other } = this.props;

    return (
      <div {...other}>
        <div className="label">Hello:</div>
        <div className="value" data-test="value">
          {children}
        </div>
      </div>
    );
  }
}

Hello.propTypes = {
  children: PropTypes.node.isRequired
};

const Stateless = ({ className, children }) => (
  <Hello className={className}>{children}</Hello>
);

Stateless.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

describe("react-dom-test", () => {
  describe("mount", () => {
    it("renders the given component into the dom and returns the node", () => {
      expect(
        mount(<Hello>Jane Doe</Hello>),
        "queried for first",
        "[data-test=value]",
        "to have text",
        "Jane Doe"
      );
    });

    describe("on a stateless component", () => {
      it("renders the given component into the dom and returns the node", () => {
        expect(
          mount(<Stateless className="fancy">I am stateless</Stateless>),
          "queried for first",
          "[data-test=value]",
          "to have text",
          "I am stateless"
        ).and("to have class", "fancy");
      });
    });

    it("can be used for low-level DOM testing of React components", () => {
      const node = mount(<Hello>Jane Doe</Hello>);

      expect(
        node.querySelector("[data-test=value]").textContent,
        "to equal",
        "Jane Doe"
      );
    });
  });
});
