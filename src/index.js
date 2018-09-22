import ReactDom from "react-dom";
import { Simulate } from "react-dom/test-utils";

export function mount(element) {
  const div = document.createElement("div");
  ReactDom.render(element, div);
  return div.firstChild;
}

export function simulate(rootElement, events) {
  []
    .concat(events)
    .map(event => (typeof event === "string" ? { type: event } : event))
    .forEach(event => {
      let target = rootElement;

      if (event.target) {
        target = rootElement.querySelector(event.target);
        if (!target) {
          throw new Error(
            `Could not trigger ${event.type} on '${event.target}' in\n${
              rootElement.outerHTML
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

      Simulate[event.type](target, event.data);
    });
}

export { Simulate } from "react-dom/test-utils";
export { default as Ignore } from "./Ignore";
