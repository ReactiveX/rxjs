/** @prettier */
import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';
import { TeardownLogic, PartialObserver } from '../../types';
import { createErrorClass } from '../../util/createErrorClass';

export interface AjaxRequest {
  url?: string;
  body?: any;
  user?: string;
  async?: boolean;
  method?: string;
  headers?: Readonly<Record<string, any>>;
  timeout?: number;
  password?: string;
  hasContent?: boolean;
  crossDomain?: boolean;
  withCredentials?: boolean;
  createXHR?: () => XMLHttpRequest;
  progressSubscriber?: PartialObserver<ProgressEvent>;
  responseType?: string;
}

function isFormData(body: any): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class AjaxObservable<T> extends Observable<T> {
  private request: AjaxRequest;

  constructor(urlOrRequest: string | AjaxRequest) {
    super();

    this.request =
      typeof urlOrRequest === 'string'
        ? {
            url: urlOrRequest,
          }
        : urlOrRequest;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): TeardownLogic {
    return new AjaxSubscriber(subscriber, this.request);
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class AjaxSubscriber<T> extends Subscriber<Event> {
  private xhr: XMLHttpRequest;
  private done: boolean = false;
  public request: AjaxRequest;

  constructor(destination: Subscriber<T>, request: AjaxRequest) {
    super(destination);

    // Normalize the headers. We're going to make them all lowercase, since
    // Headers are case insenstive by design. This makes it easier to verify
    // that we aren't setting or sending duplicates.
    const headers: Record<string, any> = {};
    const requestHeaders = request.headers;
    if (requestHeaders) {
      for (const key in requestHeaders) {
        if (requestHeaders.hasOwnProperty(key)) {
          headers[key.toLowerCase()] = requestHeaders[key];
        }
      }
    }

    // Set the x-requested-with header. This is a non-standard header that has
    // come to be a defacto standard for HTTP requests sent by libraries and frameworks
    // using XHR. However, we DO NOT want to set this if it is a CORS request. This is
    // because sometimes this header can cause issues with CORS. To be clear,
    // None of this is necessary, it's only being set because it's "the thing libraries do"
    // Starting back as far as JQuery, and continuing with other libraries such as Angular 1,
    // Axios, et al.
    if (!request.crossDomain && !('x-requested-with' in headers)) {
      headers['x-requested-with'] = 'XMLHttpRequest';
    }

    // Ensure content type is set
    if (!('content-type' in headers) && request.body !== undefined && !isFormData(request.body)) {
      headers['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    const body: string | undefined = this.serializeBody(request.body, headers['content-type']);

    this.request = {
      // Default values
      async: true,
      crossDomain: true,
      withCredentials: false,
      method: 'GET',
      responseType: 'json',
      timeout: 0,

      // Override with passed user values
      ...request,

      // Set values we ensured above
      headers,
      body,
    };

    // Create our XHR so we can get started.
    this.xhr = request.createXHR ? request.createXHR() : new XMLHttpRequest();

    this.send();
  }

  next(e: Event): void {
    this.done = true;
    const destination = this.destination as Subscriber<any>;
    let result: AjaxResponse;
    try {
      result = new AjaxResponse(e, this.xhr, this.request);
    } catch (err) {
      destination.error(err);
      return;
    }
    destination.next(result);
  }

  private send(): void {
    const {
      xhr,
      request,
      request: { user, method, url, async, password, headers, body },
    } = this;
    try {
      // set up the events before open XHR
      // https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
      // You need to add the event listeners before calling open() on the request.
      // Otherwise the progress events will not fire.
      this.setupEvents(xhr, request);

      // open XHR
      if (user) {
        xhr.open(method!, url!, async!, user, password);
      } else {
        xhr.open(method!, url!, async!);
      }

      // timeout, responseType and withCredentials can be set once the XHR is open
      if (async) {
        xhr.timeout = request.timeout!;
        xhr.responseType = request.responseType as any;
      }

      if ('withCredentials' in xhr) {
        xhr.withCredentials = !!request.withCredentials;
      }

      // set headers
      for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, (headers as any)[key]);
        }
      }

      // finally send the request
      if (body) {
        xhr.send(body);
      } else {
        xhr.send();
      }
    } catch (err) {
      this.error(err);
    }
  }

  private serializeBody(body: any, contentType?: string) {
    if (!body || typeof body === 'string' || isFormData(body)) {
      return body;
    }

    if (contentType) {
      const splitIndex = contentType.indexOf(';');
      if (splitIndex !== -1) {
        contentType = contentType.substring(0, splitIndex);
      }
    }

    switch (contentType) {
      case 'application/x-www-form-urlencoded':
        return Object.keys(body)
          .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`)
          .join('&');
      case 'application/json':
        return JSON.stringify(body);
      default:
        return body;
    }
  }

  private setupEvents(xhr: XMLHttpRequest, request: AjaxRequest) {
    const progressSubscriber = request.progressSubscriber;

    xhr.ontimeout = (e: ProgressEvent) => {
      progressSubscriber?.error?.(e);
      let error;
      try {
        error = new AjaxTimeoutError(xhr, request); // TODO: Make betterer.
      } catch (err) {
        error = err;
      }
      this.error(error);
    };

    if (progressSubscriber) {
      xhr.upload.onprogress = (e: ProgressEvent) => {
        progressSubscriber.next?.(e);
      };
    }

    xhr.onerror = (e: ProgressEvent) => {
      progressSubscriber?.error?.(e);
      this.error(new AjaxError('ajax error', xhr, request));
    };

    xhr.onload = (e: ProgressEvent) => {
      // 4xx and 5xx should error (https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
      if (xhr.status < 400) {
        progressSubscriber?.complete?.();
        this.next(e);
        this.complete();
      } else {
        progressSubscriber?.error?.(e);
        let error;
        try {
          error = new AjaxError('ajax error ' + xhr.status, xhr, request);
        } catch (err) {
          error = err;
        }
        this.error(error);
      }
    };
  }

  unsubscribe() {
    const { done, xhr } = this;
    if (!done && xhr) {
      xhr.abort();
    }
    super.unsubscribe();
  }
}

/**
 * A normalized AJAX response.
 *
 * @see {@link ajax}
 *
 * @class AjaxResponse
 */
export class AjaxResponse {
  /** @type {number} The HTTP status code */
  status: number;

  /** @type {string|ArrayBuffer|Document|object|any} The response data */
  response: any;

  /** @type {string} The raw responseText */
  // @ts-ignore: Property has no initializer and is not definitely assigned
  responseText: string;

  /** @type {string} The responseType (e.g. 'json', 'arraybuffer', or 'xml') */
  responseType: string;

  constructor(public originalEvent: Event, public xhr: XMLHttpRequest, public request: AjaxRequest) {
    this.status = xhr.status;
    this.responseType = xhr.responseType || request.responseType!;
    this.response = getXHRResponse(xhr);
  }
}

export type AjaxErrorNames = 'AjaxError' | 'AjaxTimeoutError';

/**
 * A normalized AJAX error.
 *
 * @see {@link ajax}
 *
 * @class AjaxError
 */
export interface AjaxError extends Error {
  /**
   * The XHR instance associated with the error
   */
  xhr: XMLHttpRequest;

  /**
   * The AjaxRequest associated with the error
   */
  request: AjaxRequest;

  /**
   *The HTTP status code
   */
  status: number;

  /**
   *The responseType (e.g. 'json', 'arraybuffer', or 'xml')
   */
  responseType: XMLHttpRequestResponseType;

  /**
   * The response data
   */
  response: any;
}

export interface AjaxErrorCtor {
  /**
   * Internal use only. Do not manually create instances of this type.
   * @internal
   */
  new (message: string, xhr: XMLHttpRequest, request: AjaxRequest): AjaxError;
}

/**
 * Thrown when an error occurs during an AJAX request.
 * This is only exported because it is useful for checking to see if an error
 * is an `instanceof AjaxError`. DO NOT create new instances of `AjaxError` with
 * the constructor.
 *
 * @class AjaxError
 * @see ajax
 */
export const AjaxError: AjaxErrorCtor = createErrorClass(
  (_super) =>
    function AjaxError(this: any, message: string, xhr: XMLHttpRequest, request: AjaxRequest) {
      _super(this);
      this.message = message;
      this.xhr = xhr;
      this.request = request;
      this.status = xhr.status;
      this.responseType = xhr.responseType;
      let response: any;
      try {
        response = getXHRResponse(xhr);
      } catch (err) {
        response = xhr.responseText;
      }
      this.response = response;
    }
);

function getXHRResponse(xhr: XMLHttpRequest) {
  switch (xhr.responseType) {
    case 'json': {
      if ('response' in xhr) {
        return xhr.response;
      } else {
        // IE
        const ieXHR: any = xhr;
        return JSON.parse(ieXHR.responseText);
      }
    }
    case 'document':
      return xhr.responseXML;
    case 'text':
    default: {
      if ('response' in xhr) {
        return xhr.response;
      } else {
        // IE
        const ieXHR: any = xhr;
        return ieXHR.responseText;
      }
    }
  }
}

export interface AjaxTimeoutError extends AjaxError {}

export interface AjaxTimeoutErrorCtor {
  /**
   * Internal use only. Do not manually create instances of this type.
   * @internal
   */
  new (xhr: XMLHttpRequest, request: AjaxRequest): AjaxTimeoutError;
}

// NOTE: We are not using createErrorClass here, because we're deriving this from
// the AjaxError we defined above.
const AjaxTimeoutErrorImpl = (() => {
  function AjaxTimeoutErrorImpl(this: any, xhr: XMLHttpRequest, request: AjaxRequest) {
    AjaxError.call(this, 'ajax timeout', xhr, request);
    this.name = 'AjaxTimeoutError';
    return this;
  }
  AjaxTimeoutErrorImpl.prototype = Object.create(AjaxError.prototype);
  return AjaxTimeoutErrorImpl;
})();

/**
 * Thrown when an AJAX request timesout. Not to be confused with {@link TimeoutError}.
 *
 * This is exported only because it is useful for checking to see if errors are an
 * `instanceof AjaxTimeoutError`. DO NOT use the constructor to create an instance of
 * this type.
 *
 * @class AjaxTimeoutError
 * @see ajax
 */
export const AjaxTimeoutError: AjaxTimeoutErrorCtor = AjaxTimeoutErrorImpl as any;
