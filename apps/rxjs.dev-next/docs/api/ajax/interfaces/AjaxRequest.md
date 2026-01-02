[API](../../index.md) / [ajax](../index.md) / AjaxRequest

# Interface: AjaxRequest

> The object containing values RxJS used to make the HTTP request.

## Description

This is provided in [AjaxError](../classes/AjaxError.md) instances as the `request`
object.

Defined in: [rxjs/src/internal/ajax/types.ts:20](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/types.ts#L20)

## Properties

| Property                                       | Type                                      | Description                                                                                                                        |
| ---------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| <a id="async"></a> `async`                     | `boolean`                                 | Whether or not the request was made asynchronously.                                                                                |
| <a id="body"></a> `body?`                      | `any`                                     | The body to send over the HTTP request.                                                                                            |
| <a id="crossdomain"></a> `crossDomain`         | `boolean`                                 | Whether or not the request was a CORS request.                                                                                     |
| <a id="headers"></a> `headers`                 | `Readonly`\<`Record`\<`string`, `any`\>\> | The headers sent over the HTTP request.                                                                                            |
| <a id="method"></a> `method`                   | `string`                                  | The HTTP method used to make the HTTP request.                                                                                     |
| <a id="password"></a> `password?`              | `string`                                  | The user credentials password sent with the HTTP request.                                                                          |
| <a id="responsetype"></a> `responseType`       | `XMLHttpRequestResponseType`              | The [`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType) set before sending the request. |
| <a id="timeout"></a> `timeout`                 | `number`                                  | The timeout value used for the HTTP request. Note: this is only honored if the request is asynchronous (`async` is `true`).        |
| <a id="url"></a> `url`                         | `string`                                  | The URL requested.                                                                                                                 |
| <a id="user"></a> `user?`                      | `string`                                  | The user credentials user name sent with the HTTP request.                                                                         |
| <a id="withcredentials"></a> `withCredentials` | `boolean`                                 | Whether or not a CORS request was sent with credentials. If `false`, will also ignore cookies in the CORS response.                |
