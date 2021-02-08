import { AjaxRequest } from './types';
import { getXHRResponse } from './getXHRResponse';

/**
 * A normalized response from an AJAX request. To get the data from the response,
 * you will want to read the `response` property.
 *
 * - DO NOT create instances of this class directly.
 * - DO NOT subclass this class.
 *
 * It is advised not to hold this object in memory, as it has a reference to
 * the original XHR used to make the request, as well as properties containing
 * request and response data.
 *
 * @see {@link ajax}
 */
export class AjaxResponse<T> {
  /** The HTTP status code */
  readonly status: number;

  /** The response data, if any. Note that this will automatically be converted to the proper type.*/
  readonly response: T;

  /**  The responseType from the response. (For example: `""`, "arraybuffer"`, "blob"`, "document"`, "json"`, or `"text"`) */
  readonly responseType: XMLHttpRequestResponseType;

  /**
   * The total number of bytes loaded so far. To be used with {@link total} while
   * calcating progress. (You will want to set {@link includeDownloadProgress} or {@link includeDownloadProgress})
   *
   * {@see {@link AjaxConfig}}
   */
  readonly loaded: number;

  /**
   * The total number of bytes to be loaded. To be used with {@link loaded} while
   * calcating progress. (You will want to set {@link includeDownloadProgress} or {@link includeDownloadProgress})
   *
   * {@see {@link AjaxConfig}}
   */
  readonly total: number;

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
  constructor(
    /**
     * The original event object from the raw XHR event.
     */
    public readonly originalEvent: ProgressEvent,
    /**
     * The XMLHttpRequest object used to make the request.
     * NOTE: It is advised not to hold this in memory, as it will retain references to all of it's event handlers
     * and many other things related to the request.
     */
    public readonly xhr: XMLHttpRequest,
    /**
     * The request parameters used to make the HTTP request.
     */
    public readonly request: AjaxRequest,
    /**
     * The event type. This can be used to discern between different events
     * if you're using progress events with {@link includeDownloadProgress} or
     * {@link includeUploadProgress} settings in {@link AjaxConfig}.
     */
    public readonly type = 'download_load'
  ) {
    const { status, responseType } = xhr;
    this.status = status ?? 0;
    this.responseType = responseType ?? '';
    this.response = getXHRResponse(xhr);
    const { loaded, total } = originalEvent;
    this.loaded = loaded;
    this.total = total;
  }
}
