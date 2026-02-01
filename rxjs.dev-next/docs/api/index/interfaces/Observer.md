[API](../../index.md) / [index](../index.md) / Observer

# Interface: Observer

> An object interface that defines a set of callback functions a user can use to get
> notified of any set of [Observable](../classes/Observable.md)
> guide/glossary-and-semantics#notification notification events.

## Description

For more info, please refer to guide/observer this guide.

Defined in: [internal/types.ts:192](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L192)

## Extended by

- [`SubjectLike`](SubjectLike.md)
- [`TapObserver`](TapObserver.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="complete"></a> `complete` | () => `void` | A callback function that gets called by the producer if and when it has no more values to provide (by calling `next` callback function). This means that no error has happened. This callback can't be called more than one time, it can't be called if the `error` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#complete this guide. |
| <a id="error"></a> `error` | (`err`: `any`) => `void` | A callback function that gets called by the producer if and when it encountered a problem of any kind. The errored value will be provided through the `err` parameter. This callback can't be called more than one time, it can't be called if the `complete` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#error this guide. |
| <a id="next"></a> `next` | (`value`: `T`) => `void` | A callback function that gets called by the producer during the subscription when the producer "has" the `value`. It won't be called if `error` or `complete` callback functions have been called, nor after the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#next this guide. |
