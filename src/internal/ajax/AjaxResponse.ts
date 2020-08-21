/** @prettier */

import { AjaxRequest } from './types';
import { getXHRResponse } from './getXHRResponse';

/**
 * A normalized response from an AJAX request. To get the data from the response,
 * you will want to read the `response` property.
 *
 * - DO NOT create instances of this class directly.
 * - DO NOT subclass this class.
 *
 * @see {@link ajax}
 */
export class AjaxResponse<T> {
  /** The HTTP status code */
  readonly status: number;

  /** The response data */
  readonly response: T;

  /**  The responseType from the response. (For example: `""`, "arraybuffer"`, "blob"`, "document"`, "json"`, or `"text"`) */
  readonly responseType: XMLHttpRequestResponseType;

  /**
   * A normalized response from an AJAX request. To get the data from the response,
   * you will want to read the `response` property.
   *
   * - DO NOT create instances of this class directly.
   * - DO NOT subclass this class.
   *
   * @param originalEvent The original event object from the XHR `onload` event.
   * @param xhr The `XMLHttpRequest` object used to make the request. This is useful for examining status code, etc.
   * @param request The request settings used to make the HTTP request.
   */
  constructor(public readonly originalEvent: Event, public readonly xhr: XMLHttpRequest, public readonly request: AjaxRequest) {
    this.status = xhr.status;
    this.responseType = xhr.responseType;
    this.response = getXHRResponse(xhr);
  }
}
