import { defaultOptions } from '../defaultOptions';
import { Method, RequestConfig, Transformer } from '../Request';
import { combineURLs, isAbsoluteURL } from '../utils/urls';
import { HttpEvent, HttpEventType, HttpResponse } from '../Response';
import { Observable } from '../../../Observable';
import { map } from '../../../operators/map';
import { catchError } from '../../../operators/catchError';
import { throwError } from '../../throwError';

/**
 * @internal
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} transformFunctions A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
const transformData = (
  data: object | string,
  headers: Record<string, any>,
  transformFunction?: Array<Transformer> | Transformer
): object => {
  const functionArray = Array.isArray(transformFunction)
    ? transformFunction
    : !!transformFunction
      ? [transformFunction]
      : [];
  return functionArray.reduce((acc, value) => value(acc, headers), data as any);
};

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {RequestConfig} config The config that is to be used for the request
 */
const dispatchRequest = <T extends object | string = any>(config: RequestConfig): Observable<HttpEvent<T>> => {
  if (!config.url || !config.method) {
    throw new Error('Invalid request configuration');
  }

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(config.data, config.headers, config.transformRequest);

  // Flatten headers
  // TODO: verify flatten behavior
  const { common, ...rest } = config.headers;
  config.headers = {
    ...(common || {}),
    ...(rest[config.method] || {}),
    ...(rest || {})
  };

  [Method.Delete, Method.Get, Method.Head, Method.Options, Method.Patch, Method.Post, Method.Put].forEach(
    (method: string) => delete (config.headers || {})[method]
  );

  const adapter = config.adapter || defaultOptions.adapter!;

  return adapter<T>(config).pipe(
    map(response => {
      //Do not apply transform for non full response event
      if (response.type !== HttpEventType.Response) {
        return response;
      }

      const { data, headers } = response;
      // Transform response data
      return {
        ...response,
        data: transformData(data, headers, config.transformResponse)
      } as HttpResponse<T>;
    }),
    catchError((err: { response?: HttpEvent<T> }) => {
      //object can be typeof Error, do not clone via spread but apply transform to mutate
      //only apply response contains data
      if (!!err && !!err.response && err.response.type === HttpEventType.Response) {
        const { data, headers } = err.response;
        err.response.data = transformData(data, headers, config.transformResponse) as T;
      }
      return throwError(err);
    })
  );
};

export { transformData, dispatchRequest };
