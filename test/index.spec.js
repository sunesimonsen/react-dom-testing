import React, { Component, useEffect, useState } from "react";
import PropTypes from "prop-types";
import sinon from "sinon";
import unexpected from "unexpected";
import unexpectedDom from "unexpected-dom";
import unexpectedSinon from "unexpected-sinon";
import fetchAnswer from "./fetchAnswer";
import FakePromise from "fake-promise";
import "whatwg-fetch";
import fetchMock from "fetch-mock";

jest.mock("./fetchAnswer");

import { act, mount, unmount, simulate, Ignore } from "../src";

const expect = unexpected
  .clone()
  .use(unexpectedDom)
  .use(unexpectedSinon);

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

class DomFiddler extends Component {
  componentDidMount() {
    this.div = document.createElement("div");
    this.div.setAttribute("data-test-id", "portal");
    document.body.appendChild(this.div);
  }

  componentWillUnmount() {
    document.body.removeChild(this.div);
  }

  render() {
    return <div />;
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

const Checkbox = () => {
  const [checked, setChecked] = useState(false);

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={event => setChecked(!checked)}
    />
  );
};

const DelayedAnswer = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, []);

  return <div className="answer">{isReady ? "42" : "Waiting..."}</div>;
};

const PromiseGate = {
  promises: [],

  register: promise => {
    PromiseGate.promises.push(promise);
  }
};

const PromisedAnswer = () => {
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    fetchAnswer().then(answer => {
      setAnswer(answer);
    });
  }, []);

  return <div className="answer">{answer || "Waiting..."}</div>;
};

describe("react-dom-testing", () => {
  let clock;
  let fakePromise;
  beforeEach(() => {
    fakePromise = new FakePromise();
    clock = sinon.useFakeTimers();
    fetchAnswer.mockImplementation(() => fakePromise);
  });

  afterEach(() => {
    clock.restore();
    jest.restoreAllMocks();
  });

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

    describe("when given a React fragment", () => {
      it("returns a HTML document fragment", () => {
        const Fragmented = () => (
          <React.Fragment>
            <h1>Fragmentation</h1>
            <p>Everything is just so fragmented</p>
          </React.Fragment>
        );

        expect(
          mount(<Fragmented />),
          "to equal",
          mount(
            <React.Fragment>
              <h1>Fragmentation</h1>
              <p>Everything is just so fragmented</p>
            </React.Fragment>
          )
        );
      });
    });

    describe("when given a custom wrapper", () => {
      beforeEach(() => {
        sinon.spy(console, "error");
      });
      afterEach(() => {
        console.error.restore();
      });

      it("can use a custom wrapper element to avoid nesting warnings", () => {
        const tableRow = document.createElement("tr");
        const tableCell = mount(<td>Stuff</td>, { container: tableRow });
        expect(console.error, "was not called");
        expect(tableCell, "to satisfy", {
          name: "td",
          children: ["Stuff"]
        });
      });

      it("can use a custom wrapper tag name to avoid nesting warnings", () => {
        const tableCell = mount(<td>Stuff</td>, { container: "tr" });
        expect(console.error, "was not called");
        expect(tableCell, "to satisfy", {
          name: "td",
          children: ["Stuff"]
        });
      });
    });
  });

  describe("when given an empty React fragment", () => {
    it("returns null", () => {
      const Fragmented = () => <React.Fragment />;

      expect(mount(<Fragmented />), "to be null");
    });
  });

  describe("unmount", () => {
    it("unmounts a mounted component", () => {
      const component = mount(<DomFiddler />);

      expect(
        document.body,
        "to contain elements matching",
        "[data-test-id=portal]"
      );

      unmount(component);

      expect(
        document.body,
        "to contain no elements matching",
        "[data-test-id=portal]"
      );
    });
  });

  describe("simulate", () => {
    it("handles events without arguments", () => {
      const handler = sinon.spy();
      const component = mount(<button onClick={handler}>Click me!</button>);

      simulate(component).click();

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "click" });
      });
    });

    it("accepts a target selector", () => {
      const handler = sinon.spy();
      const component = mount(
        <div>
          <div>
            <button data-test-id="click-me" onClick={handler}>
              Click me!
            </button>
          </div>
        </div>
      );

      simulate(component).click("[data-test-id=click-me]");

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "click" });
      });
    });

    it("accepts event options", () => {
      const handler = sinon.spy();
      const component = mount(<button onKeyDown={handler}>Click me!</button>);

      simulate(component).keyDown({
        key: "Enter",
        keyCode: 13,
        which: 13
      });

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "keydown", key: "Enter", keyCode: 13, which: 13 });
      });
    });

    it("accepts a target selector and event options", () => {
      const handler = sinon.spy();
      const component = mount(
        <div>
          <div>
            <button data-test-id="click-me" onKeyDown={handler}>
              Click me!
            </button>
          </div>
        </div>
      );

      simulate(component).keyDown("[data-test-id=click-me]", {
        key: "Enter",
        keyCode: 13,
        which: 13
      });

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "keydown", key: "Enter", keyCode: 13, which: 13 });
      });
    });

    it("handles chaining", () => {
      const handler = sinon.spy();
      const component = mount(<button onClick={handler}>Click me!</button>);

      simulate(component)
        .click()
        .click();

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "click" });
        handler({ type: "click" });
      });
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

      simulate(peopleList)
        .change("[data-test=name-input]", { value: "Jane Doe" })
        .click("[data-test=add-person]")
        .change("[data-test=name-input]", { value: "John Doe" })
        .click("[data-test=add-person]");

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

    it("supports shortcut forms for events", () => {
      const checkbox = mount(<Checkbox />);

      simulate(checkbox).change();

      expect(checkbox, "to match", ":checked");
    });

    it("fails if not given more then 2 arguments", () => {
      const component = mount(<button>Click me!</button>);

      expect(
        () => {
          simulate(component, "click", "click");
        },
        "to throw",
        "simulate takes either one or two arguments"
      );
    });

    it("fails if it can't find the event target", () => {
      const peopleList = mount(<PeopleList />);

      expect(
        () => {
          simulate(peopleList)
            .change("[data-test=name-input]", { value: "Jane Doe" })
            .click("[data-test=add-persons]")
            .change("[data-test=name-input]", { value: "John Doe" })
            .click("[data-test=add-person]");
        },
        "to throw",
        `Could not trigger click on '[data-test=add-persons]' in
<div>
  <ol data-test="people">
  </ol>
  <label>
    Name:
    <input data-test="name-input" value="Jane Doe">
  </label>
  <button data-test="add-person">Add</button>
</div>`
      );
    });
  });

  describe("simulate (deprecated API)", () => {
    it("accepts an event type as a string", () => {
      const handler = sinon.spy();
      const component = mount(<button onClick={handler}>Click me!</button>);

      simulate(component, "click");

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "click" });
      });
    });

    it("accepts an array of event type as a strings", () => {
      const handler = sinon.spy();
      const component = mount(<button onClick={handler}>Click me!</button>);

      simulate(component, ["click", "click"]);

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "click" });
        handler({ type: "click" });
      });
    });

    it("accepts events without a target", () => {
      const handler = sinon.spy();
      const component = mount(<button onClick={handler}>Click me!</button>);

      simulate(component, { type: "click" });

      expect(handler, "to have calls satisfying", () => {
        handler({ type: "click" });
      });
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

      simulate(peopleList, [
        { type: "change", target: "[data-test=name-input]", value: "Jane Doe" },
        { type: "click", target: "[data-test=add-person]" },
        { type: "change", target: "[data-test=name-input]", value: "John Doe" },
        { type: "click", target: "[data-test=add-person]" }
      ]);

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

    it("supports shortcut forms for events", () => {
      const checkbox = mount(<Checkbox />);

      simulate(checkbox, "change");

      expect(checkbox, "to match", ":checked");
    });

    it("fails if not given more then 2 arguments", () => {
      const component = mount(<button>Click me!</button>);

      expect(
        () => {
          simulate(component, "click", "click");
        },
        "to throw",
        "simulate takes either one or two arguments"
      );
    });

    it("fails if not all events have a type", () => {
      const component = mount(<button>Click me!</button>);

      expect(
        () => {
          simulate(component, ["click", {}]);
        },
        "to throw",
        "All events must have a type"
      );
    });

    it("fails if it can't find the event target", () => {
      const peopleList = mount(<PeopleList />);

      expect(
        () => {
          simulate(peopleList, [
            {
              type: "change",
              target: "[data-test=name-input]",
              value: "Jane Doe"
            },
            { type: "click", target: "[data-test=add-persons]" },
            {
              type: "change",
              target: "[data-test=name-input]",
              value: "John Doe"
            },
            { type: "click", target: "[data-test=add-person]" }
          ]);
        },
        "to throw",
        `Could not trigger click on '[data-test=add-persons]' in
<div>
  <ol data-test="people">
  </ol>
  <label>
    Name:
    <input data-test="name-input" value="Jane Doe">
  </label>
  <button data-test="add-person">Add</button>
</div>`
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

  it("supports delayed updates", () => {
    const component = mount(<DelayedAnswer />);

    expect(component, "to have text", "Waiting...");

    act(() => {
      clock.tick(100);
    });

    expect(component, "to have text", "42");
  });

  it("supports asynchronous components", () => {
    const component = mount(<PromisedAnswer />);

    expect(component, "to have text", "Waiting...");

    act(() => {
      fakePromise.resolve("wat");
    });

    expect(component, "to have text", "wat");
  });

  it("supports components that makes requests to a mocked network", async () => {
    const NetworkComponent = () => {
      const [message, setMessage] = useState("Waiting...");
      useEffect(() => {
        fetch("/testing.json")
          .then(res => res.json())
          .then(({ message }) => {
            setMessage(message);
          });
      }, []);

      return <div data-test-id="message">{message}</div>;
    };

    fetchMock.getOnce("/testing.json", {
      message: "Hello from the network"
    });

    const component = mount(<NetworkComponent />);

    expect(component, "to have text", "Waiting...");

    await act(() => fetchMock.flush(true));

    expect(component, "to have text", "Hello from the network");
  });
});
