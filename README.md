# react-dom-testing

[![Build Status](https://travis-ci.org/sunesimonsen/react-dom-testing.svg?branch=master)](https://travis-ci.org/sunesimonsen/react-dom-testing)

A minimal React DOM testing utility based on [react-dom/test-utils](https://reactjs.org/docs/test-utils.html).

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

In case you want to specify the container element that your component will be
rendered into, you can do that the following way:

``` js
const node = mount(<Hello>Jane Doe</Hello>, { container: 'span' });
```

or

``` js
const node = mount(<Hello>Jane Doe</Hello>, {
  container: document.createElement('span')
});
```

### unmount

Unmount a mounted component from the DOM. 

You normally don't need to unmount components, it is only when your component has some side-effect that messes with the environment, like writing to the HTML body the unmount need to run to clean up. That of cause depends on the component actually cleaning up after itself.

```js
const node = mount(<Hello>Jane Doe</Hello>);
unmount(node);
```

### simulate

A function to simulate one or more events using `Simulate` object from
[react-dom/test-utils](https://reactjs.org/docs/test-utils.html).

The function takes an array of events or a single event. Each event has the
following form:

```js
{
  type: 'change', // The event type
  value: 'My value', // will be set on target when specified
  target: 'input', // an optional CSS selector specifying the target
}
```

You can also specify event data for
[Simulate](https://reactjs.org/docs/test-utils.html#simulate):

```js#evaluate:false
{
  type: "keyDown",
  target: "input",
  data: {
    keyCode: 13
  }
}
```

If you don't specify a target, the event will be issued on the root element of
the given component.

I case you just want to specify the type, you can just give a string instead of
an event object:

```js
const component = mount(<button onClick={myHandler}>Click me!</button>);

// Simulate one click
simulate(component, 'click');

// Simulate two clicks
simulate(component, ['click', 'click']);
```

```js
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
```

### act

This is just the https://reactjs.org/docs/test-utils.html#act

`act` is useful when you need to force a state transition like resolving a mocked promise:

```js
it("supports asynchronous components", () => {
  const component = mount(<PromisedAnswer />);

  expect(component, "to have text", "Waiting...");

  act(() => {
    fakePromise.resolve("wat");
  });

  expect(component, "to have text", "wat");
});
```

See the tests for more details.

## License

[MIT © Sune Simonsen](./LICENSE)
