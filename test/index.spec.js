import React, { Component } from "react";
import PropTypes from "prop-types";
import TestUtils from "react-dom/test-utils";
import unexpected from "unexpected";
import unexpectedDom from "unexpected-dom";

import { mount, Simulate, Ignore } from "../src";

const expect = unexpected.clone().use(unexpectedDom);

class Hello extends Component {
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

    it("does not add a data-reactroot attribute", () => {
      const jane = mount(<Hello>Jane Doe</Hello>);
      const john = mount(<Hello>John Doe</Hello>);

      expect(
        [jane, john],
        "to have items satisfying",
        expect.it("not to have attribute", "data-reactroot")
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

  describe("Simulate", () => {
    it("is just Simulate from react-dom/test-utils", () => {
      expect(Simulate, "to be", TestUtils.Simulate);
    });

    class PeopleList extends Component {
      constructor(props) {
        super(props);
        this.state = {
          name: "",
          people: []
        };
      }

      render() {
        const { name, people } = this.state;

        return (
          <div>
            <ol data-test="people">
              {people.map((person, i) => <li key={i}>{person}</li>)}
            </ol>

            <label>
              Name:
              <input
                value={name}
                onChange={e => this.setState({ name: e.target.value })}
                data-test="name-input"
              />
            </label>
            <button
              onClick={() =>
                this.setState(({ name, people }) => ({
                  name: "",
                  people: [...people, name]
                }))
              }
              data-test="add-person"
            >
              Add
            </button>
          </div>
        );
      }
    }

    it("can be used to interact with a rendered component", () => {
      const peopleList = mount(<PeopleList />);
      const input = peopleList.querySelector("[data-test=name-input]");
      const button = peopleList.querySelector("[data-test=add-person]");

      input.value = "Jane Doe";
      Simulate.change(input);
      Simulate.click(button);

      input.value = "John Doe";
      Simulate.change(input);
      Simulate.click(button);

      expect(
        peopleList,
        "queried for first",
        "[data-test=people]",
        "to satisfy",
        mount(
          <ol data-test="people">
            <li>Jane Doe</li>
            <li>John Doe</li>
          </ol>
        )
      );
    });
  });

  describe("Ignore", () => {
    it("can be used to render an ignore comment that unexpected-dom will understand", () => {
      expect(
        mount(<Hello>Jane Doe</Hello>),
        "to satisfy",
        mount(
          <div>
            <Ignore />
            <div className="value">Jane Doe</div>
          </div>
        )
      );
    });
  });
});
