/** @prettier */
import { PartialObserver } from '../types';

/**
 * The object containing values RxJS used to make the HTTP request.
 *
 * This is provided in {@link AjaxError} instances and
 */
export interface AjaxRequest {
  /**
   * The URL requested.
   */
  url: string;

  /**
   * The body to send over the HTTP request.
   */
  body?: any;

  /**
   * The HTTP method used to make the HTTP request.
   */
  method: string;

  /**
   * Whether or not the request was made asynchronously.
   */
  async: boolean;

  /**
   * The headers sent over the HTTP request.
   */
  headers: Readonly<Record<string, any>>;

  /**
   * The timeout value used for the HTTP request.
   * Note: this is only honored if the request is asynchronous (`async` is `true`).
   */
  timeout: number;

  /**
   * The user credentials user name sent with the HTTP request.
   */
  user?: string;

  /**
   * The user credentials password sent with the HTTP request.
   */
  password?: string;

  /**
   * Whether or not the request was a CORS request.
   */
  crossDomain: boolean;

  /**
   * Whether or not a CORS request was sent with credentials.
   * If `false`, will also ignore cookies in the CORS response.
   */
  withCredentials: boolean;

  /**
   * The [`responseType`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType) set before sending the request.
   */
  responseType: XMLHttpRequestResponseType;
}

/**
 * Configuration for the {@link ajax} creation function.
 */
export interface AjaxConfig {
  /** The address of the resource to request via HTTP. */
  url: string;

  /**
   * The body of the HTTP request to send.
   *
   * This is serialized, by default, based off of the valud of the `"content-type"` header.
   * For example, if the `"content-type"` is `"application/json"`, the body will be serialized
   * as JSON. If the `"content-type"` is `"application/x-www-form-urlencoded"`, whatever object passed
   * to the body will be serialized as URL, using key-value pairs based off of the keys and values of the object.
   * In all other cases, the body will be passed directly.
   */
  body?: any;

  /**
   * Whether or not to send the request asynchronously. Defaults to `true`.
   * If set to `false`, this will block the thread until the AJAX request responds.
   */
  async?: boolean;

  /**
   * The HTTP Method to use for the request. Defaults to "GET".
   */
  method?: string;

  /**
   * The HTTP headers to apply.
   *
   * Note that, by default, RxJS will add the following headers under certain conditions:
   *
   * 1. If the `"content-type"` header is **NOT** set, and the `body` is [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData),
   *    a `"content-type"` of `"application/x-www-form-urlencoded; charset=UTF-8"` will be set automatically.
   * 2. If the `"x-requested-with"` header is **NOT** set, and the `crossDomain` configuration property is **NOT** explicitly set to `true`,
   *    (meaning it is not a CORS request), a `"x-requested-with"` header with a value of `"XMLHttpRequest"` will be set automatically.
   *    This header is generally meaningless, and is set by libraries and frameworks using `XMLHttpRequest` to make HTTP requests.
   */
  headers?: Readonly<Record<string, any>>;

  /**
   * The time to wait before causing the underlying XMLHttpRequest to timeout. This is only honored if the
   * `async` configuration setting is unset or set to `true`. Defaults to `0`, which is idiomatic for "never timeout".
   */
  timeout?: number;

  /** The user credentials user name to send with the HTTP request */
  user?: string;

  /** The user credentials password to send with the HTTP request*/
  password?: string;

  /**
   * Whether or not to send the HTTP request as a CORS request.
   * Defaults to `false`.
   */
  crossDomain?: boolean;

  /**
   * To send user credentials in a CORS request, set to `true`. To exclude user credentials from
   * a CORS request, _OR_ when cookies are to be ignored by the CORS response, set to `false`.
   *
   * Defaults to `false`.
   */
  withCredentials?: boolean;

  /**
   * The name of your site's XSRF cookie.
   */
  xsrfCookieName?: string;

  /**
   * The name of a custom header that you can use to send your XSRF cookie.
   */
  xsrfHeaderName?: string;

  /**
   * Can be set to change the response type.
   * Valid values are `"arraybuffer"`, `"blob"`, `"document"`, `"json"`, and `"text"`.
   * Note that the type of `"document"` (such as an XML document) is ignored if the global context is
   * not `Window`.
   *
   * Defaults to `"json"`.
   */
  responseType?: XMLHttpRequestResponseType;

  /**
   * An optional factory used to create the XMLHttpRequest object used to make the AJAX request.
   * This is useful in environments that lack `XMLHttpRequest`, or in situations where you
   * wish to override the default `XMLHttpRequest` for some reason.
   *
   * If not provided, the `XMLHttpRequest` in global scope will be used.
   *
   * NOTE: This AJAX implementation relies on the built-in serialization and setting
   * of Content-Type headers that is provided by standards-compliant XMLHttpRequest implementations,
   * be sure any implementation you use meets that standard.
   */
  createXHR?: () => XMLHttpRequest;

  /**
   * An observer for watching the progress of an HTTP request. Will
   * emit progress events, and completes on the final load event, will error for
   * any XHR error or timeout.
   *
   * This will **not** error for errored status codes. Rather, it will always _complete_ when
   * the HTTP response comes back.
   */
  progressSubscriber?: PartialObserver<ProgressEvent>;
}
