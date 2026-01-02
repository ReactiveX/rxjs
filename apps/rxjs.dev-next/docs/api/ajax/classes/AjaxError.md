[API](../../index.md) / [ajax](../index.md) / AjaxError

# Class: AjaxError

> Thrown when an error occurs during an AJAX request.

## Description

This is only exported because it is useful for checking to see if an error
is an `instanceof AjaxError`. DO NOT create new instances of `AjaxError` with
the constructor.

Defined in: [rxjs/src/internal/ajax/errors.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/errors.ts#L11)

Thrown when an error occurs during an AJAX request.
This is only exported because it is useful for checking to see if an error
is an `instanceof AjaxError`. DO NOT create new instances of `AjaxError` with
the constructor.

## See

[ajax](../variables/ajax.md)

## Extends

- `Error`

## Extended by

- [`AjaxTimeoutError`](AjaxTimeoutError.md)

## Constructors

### Constructor

```ts
new AjaxError(
   message: string,
   xhr: XMLHttpRequest,
   request: AjaxRequest): AjaxError;
```

Defined in: [rxjs/src/internal/ajax/errors.ts:42](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/errors.ts#L42)

#### Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `message` | `string`                                      |
| `xhr`     | `XMLHttpRequest`                              |
| `request` | [`AjaxRequest`](../interfaces/AjaxRequest.md) |

#### Returns

`AjaxError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

```ts
Error.constructor;
```

## Properties

| Property                                 | Type                                          | Description                                                                   |
| ---------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| <a id="request"></a> `request`           | [`AjaxRequest`](../interfaces/AjaxRequest.md) | The AjaxRequest associated with the error.                                    |
| <a id="response"></a> `response`         | `any`                                         | The response data.                                                            |
| <a id="responsetype"></a> `responseType` | `XMLHttpRequestResponseType`                  | The responseType (e.g. 'json', 'arraybuffer', or 'xml').                      |
| <a id="status"></a> `status`             | `number`                                      | The HTTP status code, if the request has completed. If not, it is set to `0`. |
| <a id="xhr"></a> `xhr`                   | `XMLHttpRequest`                              | The XHR instance associated with the error.                                   |
