import { RequestConfig } from './Request';
import { enhanceError } from './utils/createError';

/**
 * Type enumeration for the different kinds of `HttpEvent`.
 *
 *
 */
enum HttpEventType {
  /**
   * The request was sent out over the wire.
   */
  Sent = 'Sent',

  /**
   * An upload progress event was received.
   */
  UploadProgress = 'UploadProgress',

  /**
   * The response status code and headers were received.
   */
  ResponseHeader = 'ResponseHeader',

  /**
   * A download progress event was received.
   */
  DownloadProgress = 'DownloadProgress',

  /**
   * The full response including the body was received.
   */
  Response = 'Response',

  /**
   * A custom event from an interceptor or a backend.
   */
  User = 'User'
}

/**
 * An event indicating that the request was sent to the server. Useful
 * when a request may be retried multiple times, to distinguish between
 * retries on the final event stream.
 *
 *
 */
interface HttpSentEvent {
  type: HttpEventType.Sent;
}

/**
 * A full HTTP response, including a typed response body (which may be `null`
 * if one was not returned).
 *
 * `HttpResponse` is a `HttpEvent` available on the response event
 * stream.
 *
 */
interface HttpResponse<T = any> {
  type: HttpEventType.Response;
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: RequestConfig;
  request?: any;
  /**
   *  response URL from the XMLHttpResponse instance and fall back on the request URL.
   */
  responseUrl?: string;
}

/**
 * A partial HTTP response which only includes the status and header data,
 * but no response body.
 *
 * `HttpHeaderResponse` is a `HttpEvent` available on the response
 * event stream, only when progress events are requested.
 *
 *
 */
type HttpHeaderResponse = Pick<HttpResponse<any>, Exclude<keyof HttpResponse<any>, 'type' | 'data'>> & {
  url: string;
  type: HttpEventType.ResponseHeader;
};

/**
 * Base interface for progress events.
 *
 *
 */
interface HttpProgressEvent {
  /**
   * Progress event type is either upload or download.
   */
  type: HttpEventType.DownloadProgress | HttpEventType.UploadProgress;

  /**
   * Number of bytes uploaded or downloaded.
   */
  loaded: number;

  /**
   * Total number of bytes to upload or download. Depending on the request or
   * response, this may not be computable and thus may not be present.
   */
  total?: number;
}

/**
 * A download progress event.
 *
 *
 */
interface HttpDownloadProgressEvent extends HttpProgressEvent {
  type: HttpEventType.DownloadProgress;

  /**
   * The partial response body as downloaded so far.
   *
   * Only present if the responseType was `text`.
   */
  partialText?: string;
}

/**
 * An upload progress event.
 *
 *
 */
interface HttpUploadProgressEvent extends HttpProgressEvent {
  type: HttpEventType.UploadProgress;
}

type HttpErrorResponse = ReturnType<typeof enhanceError>;

/**
 * Union type for all possible events on the response stream.
 *
 * Typed according to the expected type of the response.
 *
 *
 */
type HttpEvent<T> = HttpSentEvent | HttpHeaderResponse | HttpResponse<T> | HttpProgressEvent;

export {
  HttpResponse,
  HttpEvent,
  HttpSentEvent,
  HttpProgressEvent,
  HttpHeaderResponse,
  HttpUploadProgressEvent,
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEventType
};
