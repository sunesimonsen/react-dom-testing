import ReactDom from "react-dom";

export function mount(element) {
  const div = document.createElement("div");
  ReactDom.render(element, div);
  return div.firstChild;
}

export { Simulate } from "react-dom/test-utils";
export { default as Ignore } from "./Ignore";
