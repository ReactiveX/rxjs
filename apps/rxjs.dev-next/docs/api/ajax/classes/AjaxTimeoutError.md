[API](../../index.md) / [ajax](../index.md) / AjaxTimeoutError

# Class: AjaxTimeoutError

> Thrown when an AJAX request times out. Not to be confused with [TimeoutError](../../rxjs/classes/TimeoutError.md).

## Description

This is exported only because it is useful for checking to see if errors are an
`instanceof AjaxTimeoutError`. DO NOT use the constructor to create an instance of
this type.

Defined in: [rxjs/src/internal/ajax/errors.ts:62](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/errors.ts#L62)

## See

[ajax](../variables/ajax.md)

## Extends

- [`AjaxError`](AjaxError.md)

## Constructors

### Constructor

```ts
new AjaxTimeoutError(xhr: XMLHttpRequest, request: AjaxRequest): AjaxTimeoutError;
```

Defined in: [rxjs/src/internal/ajax/errors.ts:67](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/errors.ts#L67)

#### Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `xhr`     | `XMLHttpRequest`                              |
| `request` | [`AjaxRequest`](../interfaces/AjaxRequest.md) |

#### Returns

`AjaxTimeoutError`

#### Deprecated

Internal implementation detail. Do not construct error instances.
Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269

#### Overrides

[`AjaxError`](AjaxError.md).[`constructor`](AjaxError.md#constructor)

## Properties

| Property                                 | Type                                          | Description                                                                   | Inherited from                                                          |
| ---------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <a id="request"></a> `request`           | [`AjaxRequest`](../interfaces/AjaxRequest.md) | The AjaxRequest associated with the error.                                    | [`AjaxError`](AjaxError.md).[`request`](AjaxError.md#request)           |
| <a id="response"></a> `response`         | `any`                                         | The response data.                                                            | [`AjaxError`](AjaxError.md).[`response`](AjaxError.md#response)         |
| <a id="responsetype"></a> `responseType` | `XMLHttpRequestResponseType`                  | The responseType (e.g. 'json', 'arraybuffer', or 'xml').                      | [`AjaxError`](AjaxError.md).[`responseType`](AjaxError.md#responsetype) |
| <a id="status"></a> `status`             | `number`                                      | The HTTP status code, if the request has completed. If not, it is set to `0`. | [`AjaxError`](AjaxError.md).[`status`](AjaxError.md#status)             |
| <a id="xhr"></a> `xhr`                   | `XMLHttpRequest`                              | The XHR instance associated with the error.                                   | [`AjaxError`](AjaxError.md).[`xhr`](AjaxError.md#xhr)                   |
