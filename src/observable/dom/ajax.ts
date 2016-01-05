import {root} from '../../util/root';
import {tryCatch} from '../../util/tryCatch';
import {errorObject} from '../../util/errorObject';
import {Observable} from '../../Observable';
import {Subscriber} from '../../Subscriber';
import {Subscription} from '../../Subscription';

interface AjaxSettings {
  url?: string;
  body?: any;
  user?: string;
  async?: boolean;
  method: string;
  headers?: Object;
  timeout?: number;
  password?: string;
  emitType?: string;
  hasContent?: boolean;
  responseType?: string;
  crossDomain?: boolean;
  createXHR?: () => XMLHttpRequest;
  normalizeError?: (e: any, xhr: any, type: any) => any;
  normalizeSuccess?: (e: any, xhr: any, settings: any) => any;
  progressSubscriber?: Subscriber<any>;
}

  /**
   * Creates an observable for an Ajax request with either a settings object with url, headers, etc or a string for a URL.
   *
   * @example
   *   source = Rx.Observable.ajax('/products');
   *   source = Rx.Observable.ajax( url: 'products', method: 'GET' });
   *
   * @param {Object} settings Can be one of the following:
   *
   *  A string of the URL to make the Ajax call.
   *  An object with the following properties
   *   - url: URL of the request
   *   - body: The body of the request
   *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
   *   - async: Whether the request is async
   *   - headers: Optional headers
   *   - crossDomain: true if a cross domain request, else false
   *
   * @returns {Observable} An observable sequence containing the XMLHttpRequest.
  */
export class AjaxObservable<T> extends Observable<T> {

  static create<T>(options: string | any): Observable<T> {
    return new AjaxObservable(options);
  }

  private settings: AjaxSettings;

  constructor(options: string | any) {
    super();

    const settings: AjaxSettings = {
      method: 'GET',
      crossDomain: false,
      async: true,
      headers: {},
      emitType: 'text',
      responseType: 'text',
      timeout: 0,
      createXHR: function() {
        return this.crossDomain ? getCORSRequest() : getXMLHttpRequest();
      },
      normalizeError: normalizeAjaxErrorEvent,
      normalizeSuccess: normalizeAjaxSuccessEvent
    };

    if (typeof options === 'string') {
      settings.url = options;
    } else {
      for (const prop in options) {
        if (options.hasOwnProperty(prop)) {
          settings[prop] = options[prop];
        }
      }
    }

    if (!settings.crossDomain && !settings.headers['X-Requested-With']) {
      settings.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    settings.hasContent = settings.body !== undefined;

    this.settings = settings;
  }

  _subscribe(subscriber: Subscriber<T>): Subscription | Function | void {

    let done = false;
    const {settings} = this;
    const {
      createXHR, user, password, timeout, method,
      url, async, headers, hasContent, body, emitType,
      normalizeError, normalizeSuccess, progressSubscriber
    } = settings;

    let result: any = tryCatch(createXHR).call(settings);

    if (result === errorObject) {
      return subscriber.error(errorObject.e);
    }

    const xhr: XMLHttpRequest = (<XMLHttpRequest> result);

    if (user) {
      result = tryCatch(xhr.open).call(xhr, method, url, async, user, password);
    } else {
      result = tryCatch(xhr.open).call(xhr, method, url, async);
    }

    if (result === errorObject) {
      return subscriber.error(errorObject.e);
    }

    for (const header in headers) {
      if (headers.hasOwnProperty(header)) {
        xhr.setRequestHeader(header, headers[header]);
      }
    }

    xhr.timeout = timeout;
    xhr.ontimeout = onTimeout;

    if (!xhr.upload || ('withCredentials' in xhr) || !root.XDomainRequest) {
      xhr.onreadystatechange = onReadyStateChange;
    } else {
      xhr.onload = onLoad;
      if (progressSubscriber) {
        xhr.onprogress = onProgress;
      }
      xhr.onerror = onError;
      xhr.onabort = onAbort;
    }

    const contentType = headers['Content-Type'] ||
      headers['Content-type'] ||
      headers['content-type'];

    if (hasContent &&
       (contentType === 'application/x-www-form-urlencoded') &&
       (typeof body !== 'string')) {
      const newBody = [];
      for (const prop in body) {
        if (body.hasOwnProperty(prop)) {
          newBody.push(`${prop}=${body[prop]}`);
        }
      }
      settings.body = newBody.join('&');
    }

    result = tryCatch(xhr.send).call(xhr, hasContent && settings.body || null);

    if (result === errorObject) {
      return subscriber.error(errorObject.e);
    }

    return new Subscription(() => {
      if (!done && xhr.readyState !== 4) {
        xhr.abort();
      }
    });

    function onTimeout(e) {
      if (progressSubscriber) {
        progressSubscriber.error(e);
      }
      subscriber.error(normalizeError(e, xhr, 'timeout'));
    }

    function onLoad(e) {
      if (progressSubscriber) {
        progressSubscriber.next(e);
        progressSubscriber.complete();
      }
      processResponse(xhr, e);
    }

    function onProgress(e) {
      progressSubscriber.next(e);
    }

    function onError(e) {
      done = true;
      if (progressSubscriber) {
        progressSubscriber.error(e);
      }
      subscriber.error(normalizeError(e, xhr, 'error'));
    }

    function onAbort(e) {
      done = true;
      if (progressSubscriber) {
        progressSubscriber.error(e);
      }
      subscriber.error(normalizeError(e, xhr, 'abort'));
    }

    function onReadyStateChange(e) {
      if (xhr.readyState === 4) {
        processResponse(xhr, e);
      }
    }

    function processResponse(xhr, e) {
      done = true;
      const status: any = xhr.status === 1223 ? 204 : xhr.status;
      if ((status >= 200 && status < 300) || (status === 0) || (status === '')) {
        if (emitType === 'json') {
          subscriber.next(normalizeSuccess(e, xhr, settings).response);
        } else {
          subscriber.next(normalizeSuccess(e, xhr, settings));
        }
        if (!subscriber.isUnsubscribed) {
          subscriber.complete();
        }
      } else {
        subscriber.error(normalizeError(e, xhr, 'error'));
      }
    }
  }
}

// Gets the proper XMLHttpRequest for support for older IE
function getXMLHttpRequest() {
  if (root.XMLHttpRequest) {
    return new root.XMLHttpRequest();
  } else {
    let progId;
    try {
      let progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
      for (let i = 0; i < 3; i++) {
        try {
          progId = progIds[i];
          if (new root.ActiveXObject(progId)) {
            break;
          }
        } catch (e) {
          // noop
        }
      }
      return new root.ActiveXObject(progId);
    } catch (e) {
      throw new Error('XMLHttpRequest is not supported by your browser');
    }
  }
}

// Get CORS support even for older IE
function getCORSRequest() {
  let xhr = new root.XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.withCredentials = true;
    return xhr;
  } else if (!!root.XDomainRequest) {
    return new root.XDomainRequest();
  } else {
    throw new Error('CORS is not supported by your browser');
  }
}

function normalizeAjaxSuccessEvent(originalEvent, xhr, settings) {
  let { status, response } = xhr;
  const { responseType } = settings;
  if (!('response' in xhr)) {
    response = xhr.responseText;
  }
  if (responseType === 'json') {
    response = JSON.parse(response || '');
  }
  return { xhr, status, response, responseType, originalEvent };
}

function normalizeAjaxErrorEvent(originalEvent, xhr, type) {
  return { xhr, type, status: xhr.status, originalEvent };
}
