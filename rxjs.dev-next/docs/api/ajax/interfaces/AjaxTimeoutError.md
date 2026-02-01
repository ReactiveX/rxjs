[API](../../index.md) / [ajax](../index.md) / AjaxTimeoutError

# Interface: AjaxTimeoutError

## Description

A normalized AJAX error.

Defined in: [internal/ajax/errors.ts:75](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/ajax/errors.ts#L75)

A normalized AJAX error.

## See

[ajax](../variables/ajax.md)

## Extends

- [`AjaxError`](AjaxError.md)

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="request"></a> `request` | [`AjaxRequest`](AjaxRequest.md) | The AjaxRequest associated with the error. | [`AjaxError`](AjaxError.md).[`request`](AjaxError.md#request) |
| <a id="response"></a> `response` | `any` | The response data. | [`AjaxError`](AjaxError.md).[`response`](AjaxError.md#response) |
| <a id="responsetype"></a> `responseType` | `XMLHttpRequestResponseType` | The responseType (e.g. 'json', 'arraybuffer', or 'xml'). | [`AjaxError`](AjaxError.md).[`responseType`](AjaxError.md#responsetype) |
| <a id="status"></a> `status` | `number` | The HTTP status code, if the request has completed. If not, it is set to `0`. | [`AjaxError`](AjaxError.md).[`status`](AjaxError.md#status) |
| <a id="xhr"></a> `xhr` | `XMLHttpRequest` | The XHR instance associated with the error. | [`AjaxError`](AjaxError.md).[`xhr`](AjaxError.md#xhr) |
