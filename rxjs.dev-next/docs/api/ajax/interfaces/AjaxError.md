[API](../../index.md) / [ajax](../index.md) / AjaxError

# Interface: AjaxError

## Description

A normalized AJAX error.

Defined in: [internal/ajax/errors.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/ajax/errors.ts#L10)

A normalized AJAX error.

## See

[ajax](../variables/ajax.md)

## Extends

- `Error`

## Extended by

- [`AjaxTimeoutError`](AjaxTimeoutError.md)

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="request"></a> `request` | [`AjaxRequest`](AjaxRequest.md) | The AjaxRequest associated with the error. |
| <a id="response"></a> `response` | `any` | The response data. |
| <a id="responsetype"></a> `responseType` | `XMLHttpRequestResponseType` | The responseType (e.g. 'json', 'arraybuffer', or 'xml'). |
| <a id="status"></a> `status` | `number` | The HTTP status code, if the request has completed. If not, it is set to `0`. |
| <a id="xhr"></a> `xhr` | `XMLHttpRequest` | The XHR instance associated with the error. |
