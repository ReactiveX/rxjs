[API](../../index.md) / [rxjs](../index.md) / generate

# Function: generate()

## Call Signature

```ts
function generate<>(
  initialState: S,
  condition: ConditionFunc<S>,
  iterate: IterateFunc<S>,
  resultSelector: ResultFunc<S, T>,
  scheduler?: SchedulerLike
): Observable<T>;
```

Defined in: [rxjs/src/internal/observable/generate.ts:93](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/generate.ts#L93)

Generates an observable sequence by running a state-driven loop
producing the sequence's elements, using the specified scheduler
to send out observer messages.

![](/images/marble-diagrams/generate.png)

### Parameters

| Parameter        | Type                                              | Description                                                                                                                          |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `initialState`   | `S`                                               | Initial state.                                                                                                                       |
| `condition`      | `ConditionFunc`\<`S`\>                            | Condition to terminate generation (upon returning false).                                                                            |
| `iterate`        | `IterateFunc`\<`S`\>                              | Iteration step function.                                                                                                             |
| `resultSelector` | `ResultFunc`\<`S`, `T`\>                          | Selector function for results produced in the sequence.                                                                              |
| `scheduler?`     | [`SchedulerLike`](../interfaces/SchedulerLike.md) | A [SchedulerLike](../interfaces/SchedulerLike.md) on which to run the generator loop. If not provided, defaults to emit immediately. |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

The generated sequence.

### Example

Produces sequence of numbers

```ts
import { generate } from 'rxjs';

const result = generate(
  0,
  (x) => x < 3,
  (x) => x + 1,
  (x) => x
);

result.subscribe((x) => console.log(x));

// Logs:
// 0
// 1
// 2
```

Use `asapScheduler`

```ts
import { generate, asapScheduler } from 'rxjs';

const result = generate(
  1,
  (x) => x < 5,
  (x) => x * 2,
  (x) => x + 1,
  asapScheduler
);

result.subscribe((x) => console.log(x));

// Logs:
// 2
// 3
// 5
```

### See

- [from](from.md)
- [Observable](../classes/Observable.md)

### Deprecated

Instead of passing separate arguments, use the options argument.
Signatures taking separate arguments will be removed in v8.

## Call Signature

```ts
function generate<>(initialState: S, condition: ConditionFunc<S>, iterate: IterateFunc<S>, scheduler?: SchedulerLike): Observable<S>;
```

Defined in: [rxjs/src/internal/observable/generate.ts:244](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/generate.ts#L244)

Generates an Observable by running a state-driven loop
that emits an element on each iteration.

<span class="informal">Use it instead of nexting values in a for loop.</span>

![](/images/marble-diagrams/generate.png)

`generate` allows you to create a stream of values generated with a loop very similar to
a traditional for loop. The first argument of `generate` is a beginning value. The second argument
is a function that accepts this value and tests if some condition still holds. If it does,
then the loop continues, if not, it stops. The third value is a function which takes the
previously defined value and modifies it in some way on each iteration. Note how these three parameters
are direct equivalents of three expressions in a traditional for loop: the first expression
initializes some state (for example, a numeric index), the second tests if the loop can perform the next
iteration (for example, if the index is lower than 10) and the third states how the defined value
will be modified on every step (for example, the index will be incremented by one).

Return value of a `generate` operator is an Observable that on each loop iteration
emits a value. First of all, the condition function is ran. If it returns true, then the Observable
emits the currently stored value (initial value at the first iteration) and finally updates
that value with iterate function. If at some point the condition returns false, then the Observable
completes at that moment.

Optionally you can pass a fourth parameter to `generate` - a result selector function which allows you
to immediately map the value that would normally be emitted by an Observable.

If you find three anonymous functions in `generate` call hard to read, you can provide
a single object to the operator instead where the object has the properties: `initialState`,
`condition`, `iterate` and `resultSelector`, which should have respective values that you
would normally pass to `generate`. `resultSelector` is still optional, but that form
of calling `generate` allows you to omit `condition` as well. If you omit it, that means
condition always holds, or in other words the resulting Observable will never complete.

Both forms of `generate` can optionally accept a scheduler. In case of a multi-parameter call,
scheduler simply comes as a last argument (no matter if there is a `resultSelector`
function or not). In case of a single-parameter call, you can provide it as a
`scheduler` property on the object passed to the operator. In both cases, a scheduler decides when
the next iteration of the loop will happen and therefore when the next value will be emitted
by the Observable. For example, to ensure that each value is pushed to the Observer
on a separate task in the event loop, you could use the `asyncScheduler` scheduler. Note that
by default (when no scheduler is passed) values are simply emitted synchronously.

### Parameters

| Parameter      | Type                                              | Description                                                                                                                   |
| -------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `initialState` | `S`                                               | Initial state.                                                                                                                |
| `condition`    | `ConditionFunc`\<`S`\>                            | Condition to terminate generation (upon returning false).                                                                     |
| `iterate`      | `IterateFunc`\<`S`\>                              | Iteration step function.                                                                                                      |
| `scheduler?`   | [`SchedulerLike`](../interfaces/SchedulerLike.md) | A [Scheduler](../classes/Scheduler.md) on which to run the generator loop. If not provided, defaults to emitting immediately. |

### Returns

[`Observable`](../classes/Observable.md)\<`S`\>

The generated sequence.

### Example

Use with condition and iterate functions

```ts
import { generate } from 'rxjs';

const result = generate(
  0,
  (x) => x < 3,
  (x) => x + 1
);

result.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Complete!'),
});

// Logs:
// 0
// 1
// 2
// 'Complete!'
```

Use with condition, iterate and resultSelector functions

```ts
import { generate } from 'rxjs';

const result = generate(
  0,
  (x) => x < 3,
  (x) => x + 1,
  (x) => x * 1000
);

result.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Complete!'),
});

// Logs:
// 0
// 1000
// 2000
// 'Complete!'
```

Use with options object

```ts
import { generate } from 'rxjs';

const result = generate({
  initialState: 0,
  condition(value) {
    return value < 3;
  },
  iterate(value) {
    return value + 1;
  },
  resultSelector(value) {
    return value * 1000;
  },
});

result.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Complete!'),
});

// Logs:
// 0
// 1000
// 2000
// 'Complete!'
```

Use options object without condition function

```ts
import { generate } from 'rxjs';

const result = generate({
  initialState: 0,
  iterate(value) {
    return value + 1;
  },
  resultSelector(value) {
    return value * 1000;
  },
});

result.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Complete!'), // This will never run
});

// Logs:
// 0
// 1000
// 2000
// 3000
// ...and never stops.
```

### See

[from](from.md)

### Deprecated

Instead of passing separate arguments, use the options argument.
Signatures taking separate arguments will be removed in v8.

## Call Signature

```ts
function generate<>(options: GenerateBaseOptions<S>): Observable<S>;
```

Defined in: [rxjs/src/internal/observable/generate.ts:291](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/generate.ts#L291)

Generates an observable sequence by running a state-driven loop
producing the sequence's elements, using the specified scheduler
to send out observer messages.
The overload accepts options object that might contain initial state, iterate,
condition and scheduler.

![](/images/marble-diagrams/generate.png)

### Parameters

| Parameter | Type                         | Description                                                                               |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| `options` | `GenerateBaseOptions`\<`S`\> | Object that must contain initialState, iterate and might contain condition and scheduler. |

### Returns

[`Observable`](../classes/Observable.md)\<`S`\>

The generated sequence.

### Example

Use options object with condition function

```ts
import { generate } from 'rxjs';

const result = generate({
  initialState: 0,
  condition: (x) => x < 3,
  iterate: (x) => x + 1,
});

result.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Complete!'),
});

// Logs:
// 0
// 1
// 2
// 'Complete!'
```

### See

- [from](from.md)
- [Observable](../classes/Observable.md)

## Call Signature

```ts
function generate<>(options: GenerateOptions<T, S>): Observable<T>;
```

Defined in: [rxjs/src/internal/observable/generate.ts:334](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/generate.ts#L334)

Generates an observable sequence by running a state-driven loop
producing the sequence's elements, using the specified scheduler
to send out observer messages.
The overload accepts options object that might contain initial state, iterate,
condition, result selector and scheduler.

![](/images/marble-diagrams/generate.png)

### Parameters

| Parameter | Type                          | Description                                                                                               |
| --------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| `options` | `GenerateOptions`\<`T`, `S`\> | Object that must contain initialState, iterate, resultSelector and might contain condition and scheduler. |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

The generated sequence.

### Example

Use options object with condition and iterate function

```ts
import { generate } from 'rxjs';

const result = generate({
  initialState: 0,
  condition: (x) => x < 3,
  iterate: (x) => x + 1,
  resultSelector: (x) => x,
});

result.subscribe({
  next: (value) => console.log(value),
  complete: () => console.log('Complete!'),
});

// Logs:
// 0
// 1
// 2
// 'Complete!'
```

### See

- [from](from.md)
- [Observable](../classes/Observable.md)
