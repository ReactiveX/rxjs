[API](../../index.md) / [rxjs](../index.md) / bindNodeCallback

# Function: bindNodeCallback()

> Converts a Node.

## Description

js-style callback API to a function that returns an
Observable.

<span class="informal">It's just like [bindCallback](bindCallback.md), but the
callback is expected to be of type `callback(error, result)`.</span>

`bindNodeCallback` is not an operator because its input and output are not
Observables. The input is a function `func` with some parameters, but the
last parameter must be a callback function that `func` calls when it is
done. The callback function is expected to follow Node.js conventions,
where the first argument to the callback is an error object, signaling
whether call was successful. If that object is passed to callback, it means
something went wrong.

The output of `bindNodeCallback` is a function that takes the same
parameters as `func`, except the last one (the callback). When the output
function is called with arguments, it will return an Observable.
If `func` calls its callback with error parameter present, Observable will
error with that value as well. If error parameter is not passed, Observable will emit
second parameter. If there are more parameters (third and so on),
Observable will emit an array with all arguments, except first error argument.

Note that `func` will not be called at the same time output function is,
but rather whenever resulting Observable is subscribed. By default call to
`func` will happen synchronously after subscription, but that can be changed
with proper `scheduler` provided as optional third parameter. [SchedulerLike](../interfaces/SchedulerLike.md)
can also control when values from callback will be emitted by Observable.
To find out more, check out documentation for [bindCallback](bindCallback.md), where
[SchedulerLike](../interfaces/SchedulerLike.md) works exactly the same.

As in [bindCallback](bindCallback.md), context (`this` property) of input function will be set to context
of returned function, when it is called.

After Observable emits value, it will complete immediately. This means
even if `func` calls callback again, values from second and consecutive
calls will never appear on the stream. If you need to handle functions
that call callbacks multiple times, check out [fromEvent](fromEvent.md) or
[fromEventPattern](fromEventPattern.md) instead.

Note that `bindNodeCallback` can be used in non-Node.js environments as well.
"Node.js-style" callbacks are just a convention, so if you write for
browsers or any other environment and API you use implements that callback style,
`bindNodeCallback` can be safely used on that API functions as well.

Remember that Error object passed to callback does not have to be an instance
of JavaScript built-in `Error` object. In fact, it does not even have to an object.
Error parameter of callback function is interpreted as "present", when value
of that parameter is truthy. It could be, for example, non-zero number, non-empty
string or boolean `true`. In all of these cases resulting Observable would error
with that value. This means usually regular style callbacks will fail very often when
`bindNodeCallback` is used. If your Observable errors much more often then you
would expect, check if callback really is called in Node.js-style and, if not,
switch to [bindCallback](bindCallback.md) instead.

Note that even if error parameter is technically present in callback, but its value
is falsy, it still won't appear in array emitted by Observable.

```ts
function bindNodeCallback<>(
  callbackFunc: (...args: [...A[], (err: any, ...res: R) => void]) => void,
  schedulerLike?: SchedulerLike
): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R<R>[0] : R>;
```

Defined in: [rxjs/src/internal/observable/bindNodeCallback.ts:13](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/bindNodeCallback.ts#L13)

Converts a Node.js-style callback API to a function that returns an
Observable.

<span class="informal">It's just like [bindCallback](bindCallback.md), but the
callback is expected to be of type `callback(error, result)`.</span>

`bindNodeCallback` is not an operator because its input and output are not
Observables. The input is a function `func` with some parameters, but the
last parameter must be a callback function that `func` calls when it is
done. The callback function is expected to follow Node.js conventions,
where the first argument to the callback is an error object, signaling
whether call was successful. If that object is passed to callback, it means
something went wrong.

The output of `bindNodeCallback` is a function that takes the same
parameters as `func`, except the last one (the callback). When the output
function is called with arguments, it will return an Observable.
If `func` calls its callback with error parameter present, Observable will
error with that value as well. If error parameter is not passed, Observable will emit
second parameter. If there are more parameters (third and so on),
Observable will emit an array with all arguments, except first error argument.

Note that `func` will not be called at the same time output function is,
but rather whenever resulting Observable is subscribed. By default call to
`func` will happen synchronously after subscription, but that can be changed
with proper `scheduler` provided as optional third parameter. [SchedulerLike](../interfaces/SchedulerLike.md)
can also control when values from callback will be emitted by Observable.
To find out more, check out documentation for [bindCallback](bindCallback.md), where
[SchedulerLike](../interfaces/SchedulerLike.md) works exactly the same.

As in [bindCallback](bindCallback.md), context (`this` property) of input function will be set to context
of returned function, when it is called.

After Observable emits value, it will complete immediately. This means
even if `func` calls callback again, values from second and consecutive
calls will never appear on the stream. If you need to handle functions
that call callbacks multiple times, check out [fromEvent](fromEvent.md) or
[fromEventPattern](fromEventPattern.md) instead.

Note that `bindNodeCallback` can be used in non-Node.js environments as well.
"Node.js-style" callbacks are just a convention, so if you write for
browsers or any other environment and API you use implements that callback style,
`bindNodeCallback` can be safely used on that API functions as well.

Remember that Error object passed to callback does not have to be an instance
of JavaScript built-in `Error` object. In fact, it does not even have to an object.
Error parameter of callback function is interpreted as "present", when value
of that parameter is truthy. It could be, for example, non-zero number, non-empty
string or boolean `true`. In all of these cases resulting Observable would error
with that value. This means usually regular style callbacks will fail very often when
`bindNodeCallback` is used. If your Observable errors much more often then you
would expect, check if callback really is called in Node.js-style and, if not,
switch to [bindCallback](bindCallback.md) instead.

Note that even if error parameter is technically present in callback, but its value
is falsy, it still won't appear in array emitted by Observable.

## Parameters

| Parameter        | Type                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| `callbackFunc`   | (...`args`: \[`...A[]`, (`err`: `any`, ...`res`: `R`) => `void`\]) => `void` |
| `schedulerLike?` | [`SchedulerLike`](../interfaces/SchedulerLike.md)                            |

## Returns

```ts
(...arg: A): Observable<R extends [] ? void : R extends [any] ? R<R>[0] : R>;
```

### Parameters

| Parameter | Type |
| --------- | ---- |
| ...`arg`  | `A`  |

### Returns

[`Observable`](../classes/Observable.md)\<`R` _extends_ \[\] ? `void` : `R` _extends_ \[`any`\] ? `R`\<`R`\>\[`0`\] : `R`\>

## Example

Read a file from the filesystem and get the data as an Observable

```ts
import * as fs from 'fs';
const readFileAsObservable = bindNodeCallback(fs.readFile);
const result = readFileAsObservable('./roadNames.txt', 'utf8');
result.subscribe(
  (x) => console.log(x),
  (e) => console.error(e)
);
```

Use on function calling callback with multiple arguments

```ts
someFunction((err, a, b) => {
  console.log(err); // null
  console.log(a); // 5
  console.log(b); // "some string"
});
const boundSomeFunction = bindNodeCallback(someFunction);
boundSomeFunction().subscribe((value) => {
  console.log(value); // [5, "some string"]
});
```

Use on function calling callback in regular style

```ts
someFunction(a => {
  console.log(a); // 5
});
const boundSomeFunction = bindNodeCallback(someFunction);
boundSomeFunction()
.subscribe(
  value => {}             // never gets called
  err => console.log(err) // 5
);
```

## See

- [bindCallback](bindCallback.md)
- [from](from.md)

## Param

Function with a Node.js-style callback as the last parameter.

## Param

A mapping function used to transform callback events.

## Param

The scheduler on which to schedule the callbacks.
