# react-dom-testing

[![Build Status](https://travis-ci.org/sunesimonsen/react-dom-testing.svg?branch=master)](https://travis-ci.org/sunesimonsen/react-dom-testing)

A tiny wrapper around [react-dom/test-utils](https://reactjs.org/docs/test-utils.html) to make it more convenient.

## Install

```sh
npm install --save react-dom-testing
```

## Platform support

The library is ES5 compatible and will work with any JavaScript bundler in the browser as well as Node versions with ES5 support.

## Usage

Use the `mount` function to render a React component into the DOM, the function returns the rendered DOM node. Now you can start asserting:


```js
import { mount } from 'react-dom-testing';
import React from 'react';

const Hello = ({ children }) => (
  <div>
    <div className="label">Hello:</div>
    <div className="value" data-test="value">
      {children}
    </div>
  </div>
);

const node = mount(<Hello>Jane Doe</Hello>);

assert.equal(
  node.querySelector("[data-test=value]").textContent,
  "Jane Doe"
);
```

You can use plain DOM or any DOM query library you want. You can use any fancy assertion library that have assertions for the DOM or just stick to plain asserts, you decide.

Here is the above example using [unexpected-dom](https://github.com/unexpectedjs/unexpected-dom/):

```js
import expect from 'unexpected';
import unexpectedDom from 'unexpected-dom';

expect.use(unexpectedDom);

expect(
  mount(<Hello>Jane Doe</Hello>),
  "queried for first",
  "[data-test=value]",
  "to have text",
  "Jane Doe"
);
```

That will give you some really fancy output if it fails.

## API

### mount

Renders a React component into the DOM and returns the DOM node.

```js
const node = mount(<Hello>Jane Doe</Hello>);
```

### Simulate

This is just a re-export of the `Simulate` object from [react-dom/test-utils](https://reactjs.org/docs/test-utils.html);

```js
const node = mount(<button onClick={myHandler}>Click me!</button>);

Simulate.click(node);
```

## License

[MIT © Sune Simonsen](./LICENSE)
