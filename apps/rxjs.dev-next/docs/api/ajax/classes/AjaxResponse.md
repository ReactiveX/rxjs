[API](../../index.md) / [ajax](../index.md) / AjaxResponse

# Class: AjaxResponse

> A normalized response from an AJAX request.

## Description

To get the data from the response,
you will want to read the `response` property.

- DO NOT create instances of this class directly.
- DO NOT subclass this class.

It is advised not to hold this object in memory, as it has a reference to
the original XHR used to make the request, as well as properties containing
request and response data.

Defined in: [rxjs/src/internal/ajax/AjaxResponse.ts:17](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/AjaxResponse.ts#L17)

A normalized response from an AJAX request. To get the data from the response,
you will want to read the `response` property.

- DO NOT create instances of this class directly.
- DO NOT subclass this class.

It is advised not to hold this object in memory, as it has a reference to
the original XHR used to make the request, as well as properties containing
request and response data.

## See

- [ajax](../variables/ajax.md)
- [AjaxConfig](../interfaces/AjaxConfig.md)

## Constructors

### Constructor

```ts
new AjaxResponse<>(
   originalEvent: ProgressEvent,
   xhr: XMLHttpRequest,
   request: AjaxRequest,
   type:
  | "upload_progress"
  | "upload_load"
  | "upload_loadstart"
  | "download_progress"
  | "download_load"
| "download_loadstart"): AjaxResponse<T>;
```

Defined in: [rxjs/src/internal/ajax/AjaxResponse.ts:64](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/AjaxResponse.ts#L64)

A normalized response from an AJAX request. To get the data from the response,
you will want to read the `response` property.

- DO NOT create instances of this class directly.
- DO NOT subclass this class.

#### Parameters

| Parameter       | Type                                                                                                                                      | Default value     | Description                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| `originalEvent` | `ProgressEvent`                                                                                                                           | `undefined`       | The original event object from the XHR `onload` event.                                               |
| `xhr`           | `XMLHttpRequest`                                                                                                                          | `undefined`       | The `XMLHttpRequest` object used to make the request. This is useful for examining status code, etc. |
| `request`       | [`AjaxRequest`](../interfaces/AjaxRequest.md)                                                                                             | `undefined`       | The request settings used to make the HTTP request.                                                  |
| `type`          | \| `"upload_progress"` \| `"upload_load"` \| `"upload_loadstart"` \| `"download_progress"` \| `"download_load"` \| `"download_loadstart"` | `'download_load'` | The type of the event emitted by the [ajax](../variables/ajax.md) Observable                         |

#### Returns

`AjaxResponse`\<`T`\>

## Properties

| Property                                       | Type                                                                                                                                      | Default value     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="loaded"></a> `loaded`                   | `number`                                                                                                                                  | `undefined`       | The total number of bytes loaded so far. To be used with [total](#total) while calculating progress. (You will want to set [AjaxConfig.includeDownloadProgress](../interfaces/AjaxConfig.md#includedownloadprogress)} or [AjaxConfig.includeDownloadProgress](../interfaces/AjaxConfig.md#includedownloadprogress)})                                                                                                                                                                                                                                                                                                                                                                                                                        |
| <a id="originalevent"></a> `originalEvent`     | `ProgressEvent`                                                                                                                           | `undefined`       | The original event object from the raw XHR event.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a id="request"></a> `request`                 | [`AjaxRequest`](../interfaces/AjaxRequest.md)                                                                                             | `undefined`       | The request parameters used to make the HTTP request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a id="response"></a> `response`               | `T`                                                                                                                                       | `undefined`       | The response data, if any. Note that this will automatically be converted to the proper type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <a id="responseheaders"></a> `responseHeaders` | `Record`\<`string`, `string`\>                                                                                                            | `undefined`       | A dictionary of the response headers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a id="responsetype"></a> ~~`responseType`~~   | `XMLHttpRequestResponseType`                                                                                                              | `undefined`       | The responseType set on the request. (For example: `""`, `"arraybuffer"`, `"blob"`, `"document"`, `"json"`, or `"text"`) **Deprecated** There isn't much reason to examine this. It's the same responseType set (or defaulted) on the ajax config. If you really need to examine this value, you can check it on the `request` or the `xhr`. Will be removed in v8.                                                                                                                                                                                                                                                                                                                                                                         |
| <a id="status"></a> `status`                   | `number`                                                                                                                                  | `undefined`       | The HTTP status code                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| <a id="total"></a> `total`                     | `number`                                                                                                                                  | `undefined`       | The total number of bytes to be loaded. To be used with [loaded](#loaded) while calculating progress. (You will want to set [AjaxConfig.includeDownloadProgress](../interfaces/AjaxConfig.md#includedownloadprogress)} or [AjaxConfig.includeDownloadProgress](../interfaces/AjaxConfig.md#includedownloadprogress)})                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a id="type"></a> `type`                       | \| `"upload_progress"` \| `"upload_load"` \| `"upload_loadstart"` \| `"download_progress"` \| `"download_load"` \| `"download_loadstart"` | `'download_load'` | The event type. This can be used to discern between different events if you're using progress events with [AjaxConfig.includeDownloadProgress](../interfaces/AjaxConfig.md#includedownloadprogress)} or [AjaxConfig.includeUploadProgress](../interfaces/AjaxConfig.md#includeuploadprogress)} settings in [AjaxConfig](../interfaces/AjaxConfig.md). The event type consists of two parts: the [AjaxDirection](../type-aliases/AjaxDirection.md) and the the event type. Merged with `_`, they form the `type` string. The direction can be an `upload` or a `download` direction, while an event can be `loadstart`, `progress` or `load`. `download_load` is the type of event when download has finished and the response is available. |
| <a id="xhr"></a> `xhr`                         | `XMLHttpRequest`                                                                                                                          | `undefined`       | The XMLHttpRequest object used to make the request. NOTE: It is advised not to hold this in memory, as it will retain references to all of it's event handlers and many other things related to the request.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
