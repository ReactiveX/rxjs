import { RequestConfigXHR, ResponseType } from '../Request';
import {
  HttpDownloadProgressEvent,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpResponse,
  HttpUploadProgressEvent
} from '../Response';
import { isFormData, isStandardBrowserEnv, isString, XSRF_HEADER_NAME } from '../utils/base';
import { cookies } from '../utils/cookies';
import { createError } from '../utils/createError';
import { getObserverHandler } from '../utils/getObserverHandler';
import { parseHeaders } from '../utils/parseHeaders';
import { parseJsonResponse } from '../utils/parseJsonResponse';
import { buildURL, isURLSameOrigin } from '../utils/urls';
import { xhrBackend } from './xhrBackend';
import { Observable } from '../../../Observable';
import { Observer } from '../../../types';

/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
 */
function getResponseUrl(xhr: any): string | null {
  if ('responseURL' in xhr && xhr.responseURL) {
    return xhr.responseURL;
  }
  if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
    const ret = xhr.getResponseHeader('X-Request-URL');
    return ret;
  }

  return null;
}

const xhrAdapter = <T = any>(config: RequestConfigXHR) =>
  new Observable((observer: Observer<HttpEvent<T>>) => {
    const { reportProgress, withCredentials } = config;
    const { emitError, emitComplete } = getObserverHandler(observer);
    // Start by setting up the XHR object with request method, URL, and withCredentials flag.
    const xhr: XMLHttpRequest = xhrBackend();

    // This is the return from the Observable function, which is the
    // request cancellation handler.
    const tearDown = () => {
      /* tslint:disable:no-use-before-declare */
      // On a cancellation, remove all registered event listeners.
      xhr.removeEventListener('error', onError);
      xhr.removeEventListener('load', onLoad);
      xhr.removeEventListener('abort', onAbort);

      if (reportProgress) {
        xhr.removeEventListener('progress', onDownProgress);
        if (requestData !== null && xhr.upload) {
          xhr.upload.removeEventListener('progress', onUpProgress);
        }
      }
      /* tslint:enable:no-use-before-declare */

      // Finally, abort the in-flight request.
      xhr.abort();
    };

    if (!config.url || !config.method) {
      emitError(createError(`Invalid request configuration`));
      return tearDown;
    }

    const requestData = config.data;
    const requestHeaders = config.headers || {};

    if (isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    // HTTP basic authentication
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(`${username}:${password}`);
    }

    xhr.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer));
    // Add withCredentials to request if needed
    if (!!withCredentials) {
      xhr.withCredentials = true;
    }

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (isStandardBrowserEnv()) {
      // Add xsrf header
      const xsrfValue =
        (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName
          ? cookies.read(config.xsrfCookieName)
          : undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName || XSRF_HEADER_NAME] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in xhr && !!requestHeaders) {
      Object.keys(requestHeaders)
        .map(key => [key, requestHeaders[key]])
        .filter(
          ([key]) =>
            // Ignore remove Content-Type if data is undefined
            key.toLowerCase() !== 'content-type' || !!requestData
        )
        .forEach(([key, value]) => xhr.setRequestHeader(key, value));

      // Add an Accept header if one isn't present already.
      if (!requestHeaders['Accept']) {
        xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
      }
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        const responseType = config.responseType.toLowerCase() as XMLHttpRequestResponseType;

        // JSON responses need to be processed as text. This is because if the server
        // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
        // xhr.response will be null, and xhr.responseText cannot be accessed to
        // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
        // is parsed by first requesting text and then applying JSON.parse.
        xhr.responseType = (responseType !== ResponseType.Json ? responseType : ResponseType.Text) as any;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // If progress events are enabled, response headers will be delivered
    // in two events - the HttpHeaderResponse event and the full HttpResponse
    // event. However, since response headers don't change in between these
    // two events, it doesn't make sense to parse them twice. So headerResponse
    // caches the data extracted from the response whenever it's first parsed,
    // to ensure parsing isn't duplicated.
    let headerResponse: HttpHeaderResponse | null = null;

    // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
    // state, and memoizes it into headerResponse.
    const partialFromXhr = (): HttpHeaderResponse => {
      if (headerResponse !== null) {
        return headerResponse;
      }

      const status: number = xhr.status;
      const statusText = xhr.statusText || 'OK';

      // Parse headers from XMLHttpRequest
      const headers = 'getAllResponseHeaders' in xhr ? parseHeaders(xhr.getAllResponseHeaders()) : null;

      // Read the response URL from the XMLHttpResponse instance and fall back on the
      // request URL.
      const url = getResponseUrl(xhr) || config.url;

      // Construct the HttpHeaderResponse and memoize it.
      headerResponse = { headers, status, statusText, url: url!, config, type: HttpEventType.ResponseHeader };

      return headerResponse;
    };

    // Next, a few closures are defined for the various events which XMLHttpRequest can
    // emit. This allows them to be unregistered as event listeners later.
    // First up is the load event, which represents a response being fully available.
    const onLoad = () => {
      // Read response state from the memoized partial data.
      let { headers, status, statusText, url } = partialFromXhr();

      // The body will be read out if present.
      let body: any | null = null;

      if (status !== 204) {
        // Use XMLHttpRequest.response if set, responseText otherwise.
        body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
      }

      // Normalize another potential bug (this one comes from CORS).
      if (status === 0) {
        status = !!body ? 200 : 0;
      }

      // Check whether the body needs to be parsed as JSON (in many cases the browser
      // will have done that already).
      const parsedBody =
        config.responseType === 'json' && isString(body) ? parseJsonResponse(status, body) : { ok: true, body };

      // Prepare the response
      const responseData =
        !config.responseType || config.responseType === ResponseType.Text ? xhr.responseText : xhr.response;
      const response: HttpResponse<any> = {
        type: HttpEventType.Response,
        data: parsedBody.body || responseData || null,
        status: status || xhr.status,
        statusText: statusText,
        headers,
        config,
        request: xhr,
        responseUrl: url
      };

      //This will raised as error regardless existence of `validateStatus`
      if (!parsedBody.ok) {
        emitError(createError('Response parse failed', config, response.statusText, xhr, response));
      } else {
        // The full body has been received and delivered, no further events
        // are possible. This request is complete.
        emitComplete(response);
      }
    };

    // The onError callback is called when something goes wrong at the network level.
    // Connection timeout, DNS error, offline, etc. These are actual errors, and are
    // transmitted on the error channel.
    const onError = () => {
      // Request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (xhr.status === 0 && !!xhr.responseURL && xhr.responseURL.indexOf('file:') === 0) {
        return;
      }
      emitError(createError(xhr.statusText || 'Network Error', config, null, xhr));
    };
    // Handle browser request cancellation (as opposed to a manual cancellation)
    // Teardown will remove listener before request abort, so unsubscription cancellation will not trigger error
    const onAbort = () => emitError(createError('Request aborted', config, 'ECONNABORTED', xhr));

    // The sentHeaders flag tracks whether the HttpResponseHeaders event
    // has been sent on the stream. This is necessary to track if progress
    // is enabled since the event will be sent on only the first download
    // progerss event.
    let sentHeaders = false;

    // The download progress event handler, which is only registered if
    // progress events are enabled.
    const onDownProgress = (event: ProgressEvent) => {
      // Send the HttpResponseHeaders event if it hasn't been sent already.
      if (!sentHeaders) {
        observer.next(partialFromXhr());
        sentHeaders = true;
      }

      // Start building the download progress event to deliver on the response
      // event stream.
      let progressEvent: HttpDownloadProgressEvent = {
        type: HttpEventType.DownloadProgress,
        loaded: event.loaded
      };

      // Set the total number of bytes in the event if it's available.
      if (event.lengthComputable) {
        progressEvent.total = event.total;
      }

      // If the request was for text content and a partial response is
      // available on XMLHttpRequest, include it in the progress event
      // to allow for streaming reads.
      if (xhr.responseType === ResponseType.Text && !!xhr.responseText) {
        progressEvent.partialText = xhr.responseText;
      }

      // Finally, fire the event.
      observer.next(progressEvent);
    };

    // The upload progress event handler, which is only registered if
    // progress events are enabled.
    const onUpProgress = (event: ProgressEvent) => {
      // Upload progress events are simpler. Begin building the progress
      // event.
      let progress: HttpUploadProgressEvent = {
        type: HttpEventType.UploadProgress,
        loaded: event.loaded
      };

      // If the total number of bytes being uploaded is available, include
      // it.
      if (event.lengthComputable) {
        progress.total = event.total;
      }

      // Send the event.
      observer.next(progress);
    };

    // By default, register for load and error events.
    xhr.addEventListener('load', onLoad);
    xhr.addEventListener('error', onError);

    // Progress events are only enabled if requested.
    if (config.reportProgress) {
      // Download progress is always enabled if requested.
      xhr.addEventListener('progress', onDownProgress);

      // Upload progress depends on whether there is a body to upload.
      if (!!requestData && xhr.upload) {
        xhr.upload.addEventListener('progress', onUpProgress);
      }
    }

    // Fire the request, and notify the event stream that it was fired.
    xhr.send(requestData || null);
    observer.next({ type: HttpEventType.Sent });

    return tearDown;
  });

export { xhrAdapter as adapter };
