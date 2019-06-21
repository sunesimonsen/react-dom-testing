import ReactDom from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import domspace from "domspace";

export function mount(element) {
  const container = document.createElement("div");
  if (act) {
    act(() => {
      ReactDom.render(element, container);
    });
  } else {
    ReactDom.render(element, container);
  }

  return container.firstChild;
}

export function unmount(element) {
  ReactDom.unmountComponentAtNode(element.parentNode);
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

export { Simulate } from "react-dom/test-utils";
export { default as Ignore } from "./Ignore";
