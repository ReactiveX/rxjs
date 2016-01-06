import {root} from '../../util/root';
import {tryCatch} from '../../util/tryCatch';
import {errorObject} from '../../util/errorObject';
import {Observable} from '../../Observable';
import {Subscriber} from '../../Subscriber';
import {Subscription} from '../../Subscription';

export interface AjaxRequest {
  url?: string;
  body?: any;
  user?: string;
  async?: boolean;
  method: string;
  headers?: Object;
  timeout?: number;
  password?: string;
  hasContent?: boolean;
  crossDomain?: boolean;
  createXHR?: () => XMLHttpRequest;
  progressSubscriber?: Subscriber<any>;
  resultSelector?: <T>(response: AjaxResponse) => T;
  responseType?: string;
}

const createXHRDefault = (): XMLHttpRequest => {
  let xhr = new root.XMLHttpRequest();
  if (this.crossDomain) {
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
      return xhr;
    } else if (!!root.XDomainRequest) {
      return new root.XDomainRequest();
    } else {
      throw new Error('CORS is not supported by your browser');
    }
  } else {
    return xhr;
  }
};

export interface AjaxCreationMethod {
  (): <T>(urlOrRequest: string | AjaxRequest) => Observable<T>;
  get: <T>(url: string, resultSelector?: (response: AjaxResponse) => T, headers?: Object) => Observable<T>;
  post: <T>(url: string, body?: any, headers?: Object) => Observable<T>;
  put: <T>(url: string, body?: any, headers?: Object) => Observable<T>;
  delete: <T>(url: string, headers?: Object) => Observable<T>;
  getJSON: <T, R>(url: string, resultSelector?: (data: T) => R, headers?: Object) => Observable<R>;
}

function defaultGetResultSelector<T>(response: AjaxResponse): T {
  return response.response;
}

export function ajaxGet<T>(url: string, resultSelector: (response: AjaxResponse) => T = defaultGetResultSelector, headers: Object = null) {
  return new AjaxObservable<T>({ method: 'GET', url, resultSelector, headers });
};

export function ajaxPost<T>(url: string, body?: any, headers?: Object): Observable<T> {
  return new AjaxObservable<T>({ method: 'POST', url, body, headers });
};

export function ajaxDelete<T>(url: string, headers?: Object): Observable<T> {
  return new AjaxObservable<T>({ method: 'DELETE', url, headers });
};

export function ajaxPut<T>(url: string, body?: any, headers?: Object): Observable<T> {
  return new AjaxObservable<T>({ method: 'PUT', url, body, headers });
};

export function ajaxGetJSON<T, R>(url: string, resultSelector?: (data: T) => R, headers?: Object): Observable<R> {
  const finalResultSelector = resultSelector ? (res: AjaxResponse) => resultSelector(res.response) : null;
  return new AjaxObservable<R>({ method: 'GET', url, responseType: 'json', resultSelector: finalResultSelector, headers });
};
  /**
   * Creates an observable for an Ajax request with either a request object with url, headers, etc or a string for a URL.
   *
   * @example
   *   source = Rx.Observable.ajax('/products');
   *   source = Rx.Observable.ajax( url: 'products', method: 'GET' });
   *
   * @param {Object} request Can be one of the following:
   *
   *  A string of the URL to make the Ajax call.
   *  An object with the following properties
   *   - url: URL of the request
   *   - body: The body of the request
   *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
   *   - async: Whether the request is async
   *   - headers: Optional headers
   *   - crossDomain: true if a cross domain request, else false
   *   - createXHR: a function to override if you need to use an alternate XMLHttpRequest implementation.
   *   - resultSelector: a function to use to alter the output value type of the Observable. Gets {AjaxResponse} as an argument
   * @returns {Observable} An observable sequence containing the XMLHttpRequest.
  */
export class AjaxObservable<T> extends Observable<T> {
  static create: AjaxCreationMethod = (() => {
    const create: any = (urlOrRequest: string | AjaxRequest) => {
      return new AjaxObservable(urlOrRequest);
    };

    create.get = ajaxGet;
    create.post = ajaxPost;
    create.delete = ajaxDelete;
    create.put = ajaxPut;
    create.getJSON = ajaxGetJSON;

    return <AjaxCreationMethod>create;
  })();

  static create2<T>(options: string | AjaxRequest): Observable<T> {
    return new AjaxObservable(options);
  }

  private request: AjaxRequest;

  constructor(options: string | AjaxRequest) {
    super();

    const request: AjaxRequest = {
      async: true,
      createXHR: createXHRDefault,
      crossDomain: false,
      headers: {},
      method: 'GET',
      responseType: 'json',
      timeout: 0
    };

    if (typeof options === 'string') {
      request.url = options;
    } else {
      for (const prop in options) {
        if (options.hasOwnProperty(prop)) {
          request[prop] = options[prop];
        }
      }
    }
    request.headers = request.headers || {};

    if (!request.crossDomain && !request.headers['X-Requested-With']) {
      request.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    request.hasContent = request.body !== undefined;

    this.request = request;
  }

  _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {
    return new AjaxSubscriber(subscriber, this.request);
  }
}

export class AjaxSubscriber<T> extends Subscriber<Event> {
  xhr: XMLHttpRequest;
  resultSelector: (response: AjaxResponse) => T;
  done: boolean = false;

  constructor(destination: Subscriber<T>, public request: AjaxRequest) {
    super(destination);
    this.resultSelector = request.resultSelector;
    this.xhr = this.createXHR();
    if (this.xhr) {
      this.send();
    }
  }

  next(e: Event): void {
    this.done = true;
    const { resultSelector, xhr, request, destination } = this;
    const response = new AjaxResponse(e, xhr, request);

    if (resultSelector) {
      const result = tryCatch(resultSelector)(response);
      if (result === errorObject) {
        this.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(response);
    }
  }

  private send() {
    const {
      request: { user, method, url, async, password },
      xhr
    } = this;

    let result;
    if (user) {
      result = tryCatch(xhr.open).call(xhr, method, url, async, user, password);
    } else {
      result = tryCatch(xhr.open).call(xhr, method, url, async);
    }

    if (result === errorObject) {
      return this.error(errorObject.e);
    }

    xhr.send();
  }

  private createXHR(): XMLHttpRequest {
    const request = this.request;
    const createXHR = request.createXHR;
    const xhr = tryCatch(createXHR).call(request);

    if (xhr === errorObject) {
      this.error(errorObject.e);
    } else {
      xhr.timeout = request.timeout;
      xhr.responseType = request.responseType;
      this.setupEvents(xhr, request);
      return xhr;
    }
  }

  private setupEvents(xhr: XMLHttpRequest, request: AjaxRequest) {
    const progressSubscriber = request.progressSubscriber;

    xhr.ontimeout = function xhrTimeout(e) {
      const {subscriber, progressSubscriber, request } = (<any>xhrTimeout);
      if (progressSubscriber) {
        progressSubscriber.error(e);
      }
      subscriber.error(new AjaxTimeoutError(this, request)); //TODO: Make betterer.
    };
    (<any>xhr.ontimeout).request = request;
    (<any>xhr.ontimeout).subscriber = this;
    (<any>xhr.ontimeout).progressSubscriber = progressSubscriber;

    if (xhr.upload && 'withCredentials' in xhr && root.XDomainRequest) {
      if (progressSubscriber) {
        xhr.onprogress = function xhrProgress(e) {
          const { progressSubscriber } = (<any>xhrProgress);
          progressSubscriber.next(e);
        };
        (<any>xhr.onprogress).progressSubscriber = progressSubscriber;
      }

      xhr.onerror = function xhrError(e) {
        const { progressSubscriber, subscriber, request } = (<any>xhrError);
        if (progressSubscriber) {
          progressSubscriber.error(e);
        }
        subscriber.error(new AjaxError('ajax error', this, request));
      };
      (<any>xhr.onerror).request = request;
      (<any>xhr.onerror).subscriber = this;
      (<any>xhr.onerror).progressSubscriber = progressSubscriber;
    }

    xhr.onreadystatechange = function xhrReadyStateChange(e) {
      const { subscriber, progressSubscriber, request } = (<any>xhrReadyStateChange);
      if (this.readyState === 4) {
        // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
        let status: number = this.status === 1223 ? 204 : this.status;

        // fix status code when it is 0 (0 status is undocumented).
        // Occurs when accessing file resources or on Android 4.1 stock browser
        // while retrieving files from application cache.
        if (status === 0) {
          status = (this.response || this.responseText) ? 200 : 0;
        }

        if (200 <= status && status < 300) {
          if (progressSubscriber) {
            progressSubscriber.complete();
          }
          subscriber.next(e);
          subscriber.complete();
        } else {
          if (progressSubscriber) {
            progressSubscriber.error(e);
          }
          subscriber.error(new AjaxError('ajax error ' + status, this, request));
        }
      }
    };
    (<any>xhr.onreadystatechange).subscriber = this;
    (<any>xhr.onreadystatechange).progressSubscriber = progressSubscriber;
    (<any>xhr.onreadystatechange).request = request;
  }

  unsubscribe() {
    const { done, xhr } = this;
    if (!done && xhr && xhr.readyState !== 4) {
      xhr.abort();
    }
    super.unsubscribe();
  }
}

/** A normalized AJAX response */
export class AjaxResponse {
  /** {number} the HTTP status code */
  status: number;

  /** {string|ArrayBuffer|object|any} the response data */
  response: any;

  /** {string} the raw responseText */
  responseText: string;

  /** {string} the responsType (e.g. 'json' or 'array-buffer') */
  responseType: string;

  /** {Document} an XML Document from the response */
  responseXML: Document;

  constructor(public originalEvent: Event, public xhr: XMLHttpRequest, public request: AjaxRequest) {
    this.status = xhr.status;
    const responseType = xhr.responseType;
    let response = ('response' in xhr) ? xhr.response : xhr.responseText;
    if (responseType === 'json') {
      response = JSON.parse(response || '');
    }
    this.responseText = xhr.responseText;
    this.responseType = responseType;
    this.responseXML = xhr.responseXML;
    this.response = response;
  }
}

/** A normalized AJAX error */
export class AjaxError extends Error {
  /** {XMLHttpRequest} the XHR instance associated with the error */
  xhr: XMLHttpRequest;

  /** {AjaxRequest} the AjaxRequest associated with the error */
  request: AjaxRequest;

  /** {number} the HTTP status code */
  status: number;

  constructor(message: string, xhr: XMLHttpRequest, request: AjaxRequest) {
    super(message);
    this.message = message;
    this.xhr = xhr;
    this.request = request;
    this.status = xhr.status;
  }
}

export class AjaxTimeoutError extends AjaxError {
  constructor(xhr: XMLHttpRequest, request: AjaxRequest) {
    super('ajax timeout', xhr, request);
  }
}