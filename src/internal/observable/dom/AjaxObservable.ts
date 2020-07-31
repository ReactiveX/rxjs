/** @prettier */
import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';
import { TeardownLogic, PartialObserver } from '../../types';
import { map } from '../../operators/map';

export interface AjaxRequest {
  url?: string;
  body?: any;
  user?: string;
  async?: boolean;
  method?: string;
  headers?: object;
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

export interface AjaxCreationMethod {
  (urlOrRequest: string | AjaxRequest): Observable<AjaxResponse>;
  get(url: string, headers?: Object): Observable<AjaxResponse>;
  post(url: string, body?: any, headers?: Object): Observable<AjaxResponse>;
  put(url: string, body?: any, headers?: Object): Observable<AjaxResponse>;
  patch(url: string, body?: any, headers?: Object): Observable<AjaxResponse>;
  delete(url: string, headers?: Object): Observable<AjaxResponse>;
  getJSON<T>(url: string, headers?: Object): Observable<T>;
}

export function ajaxGet(url: string, headers?: object) {
  return new AjaxObservable<AjaxResponse>({ method: 'GET', url, headers });
}

export function ajaxPost(url: string, body?: any, headers?: Object): Observable<AjaxResponse> {
  return new AjaxObservable<AjaxResponse>({ method: 'POST', url, body, headers });
}

export function ajaxDelete(url: string, headers?: Object): Observable<AjaxResponse> {
  return new AjaxObservable<AjaxResponse>({ method: 'DELETE', url, headers });
}

export function ajaxPut(url: string, body?: any, headers?: Object): Observable<AjaxResponse> {
  return new AjaxObservable<AjaxResponse>({ method: 'PUT', url, body, headers });
}

export function ajaxPatch(url: string, body?: any, headers?: Object): Observable<AjaxResponse> {
  return new AjaxObservable<AjaxResponse>({ method: 'PATCH', url, body, headers });
}

const mapResponse = map((x: AjaxResponse) => x.response);

export function ajaxGetJSON<T>(url: string, headers?: Object): Observable<T> {
  return mapResponse(
    new AjaxObservable<AjaxResponse>({
      method: 'GET',
      url,
      responseType: 'json',
      headers,
    })
  );
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class AjaxObservable<T> extends Observable<T> {
  /**
   * Creates an observable for an Ajax request with either a request object with
   * url, headers, etc or a string for a URL.
   *
   * ## Example
   * ```ts
   * import { ajax } from 'rxjs/ajax';
   *
   * const source1 = ajax('/products');
   * const source2 = ajax({ url: 'products', method: 'GET' });
   * ```
   *
   * @param {string|Object} request Can be one of the following:
   *   A string of the URL to make the Ajax call.
   *   An object with the following properties
   *   - url: URL of the request
   *   - body: The body of the request
   *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
   *   - async: Whether the request is async
   *   - headers: Optional headers
   *   - crossDomain: true if a cross domain request, else false
   *   - createXHR: a function to override if you need to use an alternate
   *   XMLHttpRequest implementation.
   *   - resultSelector: a function to use to alter the output value type of
   *   the Observable. Gets {@link AjaxResponse} as an argument.
   * @return {Observable} An observable sequence containing the XMLHttpRequest.
   * @static true
   * @name ajax
   * @owner Observable
   * @nocollapse
   */
  static create: AjaxCreationMethod = (() => {
    const create: any = (urlOrRequest: string | AjaxRequest) => {
      return new AjaxObservable(urlOrRequest);
    };

    create.get = ajaxGet;
    create.post = ajaxPost;
    create.delete = ajaxDelete;
    create.put = ajaxPut;
    create.patch = ajaxPatch;
    create.getJSON = ajaxGetJSON;

    return <AjaxCreationMethod>create;
  })();

  private request: AjaxRequest;

  constructor(urlOrRequest: string | AjaxRequest) {
    super();

    const request: AjaxRequest = {
      async: true,
      createXHR: () => new XMLHttpRequest(),
      crossDomain: true,
      withCredentials: false,
      headers: {},
      method: 'GET',
      responseType: 'json',
      timeout: 0,
    };

    if (typeof urlOrRequest === 'string') {
      request.url = urlOrRequest;
    } else {
      for (const prop in urlOrRequest) {
        if (urlOrRequest.hasOwnProperty(prop)) {
          (request as any)[prop] = (urlOrRequest as any)[prop];
        }
      }
    }

    this.request = request;
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
  // @ts-ignore: Property has no initializer and is not definitely assigned
  private xhr: XMLHttpRequest;
  private done: boolean = false;

  constructor(destination: Subscriber<T>, public request: AjaxRequest) {
    super(destination);

    const headers = (request.headers = request.headers || {});

    // force CORS if requested
    if (!request.crossDomain && !this.getHeader(headers, 'X-Requested-With')) {
      (headers as any)['X-Requested-With'] = 'XMLHttpRequest';
    }

    // ensure content type is set
    let contentTypeHeader = this.getHeader(headers, 'Content-Type');
    if (!contentTypeHeader && typeof request.body !== 'undefined' && !isFormData(request.body)) {
      (headers as any)['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    // properly serialize body
    request.body = this.serializeBody(request.body, this.getHeader(request.headers, 'Content-Type'));

    this.send();
  }

  next(e: Event): void {
    this.done = true;
    const destination = this.destination as Subscriber<any>;
    let result: AjaxResponse;
    try {
      result = new AjaxResponse(e, this.xhr, this.request);
    } catch (err) {
      return destination.error(err);
    }
    destination.next(result);
  }

  private send(): void {
    const {
      request,
      request: { user, method, url, async, password, headers, body },
    } = this;
    try {
      const xhr = (this.xhr = request.createXHR!());

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
      this.setHeaders(xhr, headers!);

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
    if (!body || typeof body === 'string') {
      return body;
    } else if (isFormData(body)) {
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

  private setHeaders(xhr: XMLHttpRequest, headers: Object) {
    for (let key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, (headers as any)[key]);
      }
    }
  }

  private getHeader(headers: {}, headerName: string): any {
    for (let key in headers) {
      if (key.toLowerCase() === headerName.toLowerCase()) {
        return (headers as any)[key];
      }
    }

    return undefined;
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
      let error;
      try {
        error = new AjaxError('ajax error', xhr, request);
      } catch (err) {
        error = err;
      }
      this.error(error);
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
    if (!done && xhr && xhr.readyState !== 4 && typeof xhr.abort === 'function') {
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
    this.response = parseXhrResponse(this.responseType, xhr);
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
  /** @type {XMLHttpRequest} The XHR instance associated with the error */
  xhr: XMLHttpRequest;

  /** @type {AjaxRequest} The AjaxRequest associated with the error */
  request: AjaxRequest;

  /** @type {number} The HTTP status code */
  status: number;

  /** @type {string} The responseType (e.g. 'json', 'arraybuffer', or 'xml') */
  responseType: string;

  /** @type {string|ArrayBuffer|Document|object|any} The response data */
  response: any;
}

export interface AjaxErrorCtor {
  new (message: string, xhr: XMLHttpRequest, request: AjaxRequest): AjaxError;
}

const AjaxErrorImpl = (() => {
  function AjaxErrorImpl(this: any, message: string, xhr: XMLHttpRequest, request: AjaxRequest): AjaxError {
    Error.call(this);
    this.message = message;
    this.name = 'AjaxError';
    this.xhr = xhr;
    this.request = request;
    this.status = xhr.status;
    this.responseType = xhr.responseType || request.responseType;
    this.response = parseXhrResponse(this.responseType, xhr);
    return this;
  }
  AjaxErrorImpl.prototype = Object.create(Error.prototype);
  return AjaxErrorImpl;
})();

export const AjaxError: AjaxErrorCtor = AjaxErrorImpl as any;

function parseJson(xhr: XMLHttpRequest) {
  // HACK(benlesh): TypeScript shennanigans
  // tslint:disable-next-line:no-any XMLHttpRequest is defined to always have 'response' inferring xhr as never for the else clause.
  if ('response' in (xhr as any)) {
    //IE does not support json as responseType, parse it internally
    return xhr.responseType ? xhr.response : JSON.parse(xhr.response || xhr.responseText || 'null');
  } else {
    return JSON.parse((xhr as any).responseText || 'null');
  }
}

function parseXhrResponse(responseType: string, xhr: XMLHttpRequest) {
  switch (responseType) {
    case 'json':
      return parseJson(xhr);
    case 'xml':
      return xhr.responseXML;
    case 'text':
    default:
      // HACK(benlesh): TypeScript shennanigans
      // tslint:disable-next-line:no-any XMLHttpRequest is defined to always have 'response' inferring xhr as never for the else sub-expression.
      return 'response' in (xhr as any) ? xhr.response : xhr.responseText;
  }
}

export interface AjaxTimeoutError extends AjaxError {}

export interface AjaxTimeoutErrorCtor {
  new (xhr: XMLHttpRequest, request: AjaxRequest): AjaxTimeoutError;
}

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
 * @see {@link ajax}
 *
 * @class AjaxTimeoutError
 */
export const AjaxTimeoutError: AjaxTimeoutErrorCtor = AjaxTimeoutErrorImpl as any;
