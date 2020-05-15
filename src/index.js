import ReactDom from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import domspace from "domspace";

const getContainer = ({ container }) => {
  if (typeof container === "string") {
    return document.createElement(container);
  }

  if (container) {
    return container;
  }

  return document.createElement("div");
};

export function mount(element, options = {}) {
  const container = getContainer(options);

  if (act) {
    act(() => {
      ReactDom.render(element, container);
    });
  } else {
    ReactDom.render(element, container);
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

export function unmount(element) {
  ReactDom.unmountComponentAtNode(element.parentNode);
}

class ElementWrapper {
  constructor(element) {
    this.element = element;
  }
}

Object.keys(Simulate).forEach(eventType => {
  if (typeof Simulate[eventType] === "function") {
    // add even method
    ElementWrapper.prototype[eventType] = function(selector, options) {
      if (!options && typeof selector !== "string") {
        options = selector;
        selector = undefined;
      }

      const target = selector
        ? this.element.querySelector(selector)
        : this.element;

      if (!target) {
        throw new Error(
          `Could not trigger ${eventType} on '${selector}' in\n${
            domspace(this.element.cloneNode(true)).outerHTML
          }`
        );
      }

      if (
        eventType === "change" &&
        options &&
        typeof options.value === "string"
      ) {
        target.value = options.value;
      }

      Simulate[eventType](target, options);
      return this;
    };
  }
});

export function simulate(rootElement, events) {
  if (arguments.length > 2) {
    throw new Error("simulate takes either one or two arguments");
  }

  if (arguments.length === 1) {
    return new ElementWrapper(rootElement);
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
