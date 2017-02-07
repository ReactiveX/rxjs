# Creating applications

RxJS is a great tool to keep your code less error prone. It does that by using pure and stateless functions. But applications are stateful, so how do we bridge the stateless world of RxJS with the stateful world of our applications?

Let us create a simple state store of the value `0`. On each click we want to increase that count in our state store.
```js
var button = document.querySelector('button');
Rx.Observable.fromEvent(button, 'click')
  // scan (reduce) to a stream of counts
  .scan(count => count + 1, 0)
  // Set the count on an element each time it changes
  .subscribe(count => document.querySelector('#count').innerHTML = count);
```
So producing state is within the world of RxJS, but changing the DOM is a side effect which happens at "the end of the line".

## State stores
Applications use state stores to hold state. These are called different things in different frameworks, like store, reducer and model, but at the core they are all just a plain object. What we also need to handle is that multiple observables can update a single state store.

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  // We map to a function that will change our state
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));
```

What we do here is mapping a click event to a state changing function. So instead of mapping to a value, we map to a function. A function will change the state of our state store. So now let us see how we actually make the change.

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));

// We create an object with our initial state. Whenever a new state change function
// is received we call it and pass the state. The new state is returned and
// ready to be changed again on the next click
var state = increase.scan((state, changeFn) => changeFn(state), {count: 0});
```

We can now add a couple of more observables which will also change the same state store.

```js
var increaseButton = document.querySelector('#increase');
var increase = Rx.Observable.fromEvent(increaseButton, 'click')
  // Again we map to a function the will increase the count
  .map(() => state => Object.assign({}, state, {count: state.count + 1}));

var decreaseButton = document.querySelector('#decrease');
var decrease = Rx.Observable.fromEvent(decreaseButton, 'click')
  // We also map to a function that will decrease the count
  .map(() => state => Object.assign({}, state, {count: state.count - 1}));

var inputElement = document.querySelector('#input');
var input = Rx.Observable.fromEvent(inputElement, 'keypress')
  // Let us also map the keypress events to produce an inputValue state
  .map(event => state => Object.assign({}, state, {inputValue: event.target.value}));

// We merge the three state change producing observables
var state = Rx.Observable.merge(
  increase,
  decrease,
  input
).scan((state, changeFn) => changeFn(state), {
  count: 0,
  inputValue: ''
});

// We subscribe to state changes and update the DOM
state.subscribe((state) => {
  document.querySelector('#count').innerHTML = state.count;
  document.querySelector('#hello').innerHTML = 'Hello ' + state.inputValue;
});

// To optimize our rendering we can check what state
// has actually changed
var prevState = {};
state.subscribe((state) => {
  if (state.count !== prevState.count) {
    document.querySelector('#count').innerHTML = state.count;
  }
  if (state.inputValue !== prevState.inputValue) {
    document.querySelector('#hello').innerHTML = 'Hello ' + state.inputValue;
  }
  prevState = state;
});
```

We can take the state store approach and use it with many different frameworks and libraries.

### Immutable JS
You can also create a global state store for your application using [Immutable JS](https://facebook.github.io/immutable-js/). Immutable JS is a great way to create immutable state stores that allows you to optimize rendering by doing shallow checks on changed values.

<!-- skip-example -->
```js
import Immutable from 'immutable';
import someObservable from './someObservable';
import someOtherObservable from './someOtherObservable';

var initialState = {
  foo: 'bar'
};

var state = Observable.merge(
  someObservable,
  someOtherObservable
).scan((state, changeFn) => changeFn(state), Immutable.fromJS(initialState));

export default state;
```

Now you can import your state in whatever UI layer you are using.

<!-- skip-example -->
```js
import state from './state';

state.subscribe(state => {
  document.querySelector('#text').innerHTML = state.get('foo');
});
```

### React
Lets look at an example where we subscribe to an observable when the component mounts and unsubscribes when it unmounts.

<!-- skip-example -->
```js
import messages from './someObservable';

class MyComponent extends ObservableComponent {
  constructor(props) {
    super(props);
    this.state = {messages: []};
  }
  componentDidMount() {
    this.messages = messages
      // Accumulate our messages in an array
      .scan((messages, message) => [message].concat(messages), [])
      // And render whenever we get a new message
      .subscribe(messages => this.setState({messages: messages}));
  }
  componentWillUnmount() {
    this.messages.unsubscribe();
  }
  render() {
    return (
      <div>
        <ul>
          {this.state.messages.map(message => <li>{message.text}</li>)}
        </ul>
      </div>
    );
  }
}

export default MyComponent;
```

There are many other ways to use observables with React as well. Take a look at these:

- [rxjs-react-component](https://www.npmjs.com/package/rxjs-react-component). It will allow you to expose observables that maps to state changes. Also use observables for lifecycle hooks
