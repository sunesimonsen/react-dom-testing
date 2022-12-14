import { act, Simulate } from "react-dom/test-utils";
import domspace from "domspace";

let createRoot;
try {
  const ReactDomClient = require("react-dom/client");
  createRoot = ReactDomClient.createRoot;
  global.IS_REACT_ACT_ENVIRONMENT = true;
} catch (e) {
  const ReactDom = require("react-dom");
  createRoot = container => {
    return {
      render(element) {
        ReactDom.render(element, container);
      },
      unmount() {
        ReactDom.unmountComponentAtNode(container);
      }
    };
  };
}

const getContainer = ({ container }) => {
  if (typeof container === "string") {
    return document.createElement(container);
  }

  if (container) {
    return container;
  }

  return document.createElement("div");
};

const rendered = new Set();

export function mount(element, options = {}) {
  const container = getContainer(options);

  const root = createRoot(container);
  rendered.add(root);

  if (act) {
    act(() => {
      root.render(element);
    });
  } else {
    root.render(element);
  }

  const childNodes = container.childNodes;

  if (childNodes.length === 0) {
    return null;
  } else if (childNodes.length === 1) {
    return childNodes[0];
  } else {
    const documentFragment = document.createDocumentFragment();

    for (let i = 0; i < childNodes.length; i += 1) {
      documentFragment.appendChild(childNodes[i].cloneNode(true));
    }

    return documentFragment;
  }
}

export function unmount() {
  for (const root of rendered) {
    if (act) {
      act(() => {
        root.unmount();
      });
    } else {
      root.unmount();
    }
  }

  rendered.clear();
}

export function simulate(rootElement, events) {
  if (arguments.length !== 2) {
    throw new Error("simulate takes exactly two arguments");
  }

  []
    .concat(events)
    .map(event => (typeof event === "string" ? { type: event } : event))
    .forEach(event => {
      let target = rootElement;

      if (!event.type) {
        throw new Error("All events must have a type");
      }

      if (event.target) {
        target = rootElement.querySelector(event.target);
        if (!target) {
          throw new Error(
            `Could not trigger ${event.type} on '${event.target}' in\n${
              domspace(rootElement.cloneNode(true)).outerHTML
            }`
          );
        }
      }

      if (event.type === "change" && typeof event.value === "string") {
        target.value = event.value;
      }

      if (!Simulate[event.type]) {
        throw new Error(
          `Event '${
            event.type
          }' is not supported by Simulate\nSee https://reactjs.org/docs/events.html#supported-events`
        );
      }

      if (act) {
        act(() => {
          Simulate[event.type](target, event.data);
        });
      } else {
        Simulate[event.type](target, event.data);
      }
    });
}

export { act, Simulate } from "react-dom/test-utils";
export { default as Ignore } from "./Ignore";
