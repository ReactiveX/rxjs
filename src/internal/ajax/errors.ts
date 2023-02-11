import { AjaxRequest } from './types';
import { getXHRResponse } from './getXHRResponse';

/**
 * Thrown when an error occurs during an AJAX request.
 *
 * @see {@link ajax}
 */
export class AjaxError extends Error {
  name = 'AjaxError';

  /**
   * The XHR instance associated with the error.
   */
  xhr: XMLHttpRequest;

  /**
   * The AjaxRequest associated with the error.
   */
  request: AjaxRequest;

  /**
   * The HTTP status code, if the request has completed. If not,
   * it is set to `0`.
   */
  status: number;

  /**
   * The responseType (e.g. 'json', 'arraybuffer', or 'xml').
   */
  responseType: XMLHttpRequestResponseType;

  /**
   * The response data.
   */
  response: any;

  constructor(message: string, xhr: XMLHttpRequest, request: AjaxRequest) {
    super(message);

    this.xhr = xhr;
    this.request = request;
    this.status = xhr.status;
    this.responseType = xhr.responseType;

    try {
      // This can throw in IE, because we have to do a JSON.parse of
      // the response in some cases to get the expected response property.
      this.response = getXHRResponse(xhr);
    } catch (err) {
      this.response = xhr.responseText;
    }
  }
}

/**
 * Thrown when an AJAX request times out. Not to be confused with {@link TimeoutError}.
 *
 * @see {@link ajax}
 */
export class AjaxTimeoutError extends AjaxError {
  name = 'AjaxTimeoutError';

  constructor(xhr: XMLHttpRequest, request: AjaxRequest) {
    super('ajax timeout', xhr, request);
  }
}
