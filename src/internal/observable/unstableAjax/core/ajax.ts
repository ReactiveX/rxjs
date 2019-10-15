import { Method, RequestConfig } from '../Request';
import { HttpErrorResponse, HttpEvent } from '../Response';
import { isString } from '../utils/base';
import { buildURL } from '../utils/urls';
import { dispatchRequest } from './dispatchRequest';
import { of } from '../../of';
import { Observable } from '../../../Observable';
import { map } from '../../../operators/map';
import { catchError } from '../../../operators/catchError';
import { throwError } from '../../throwError';
import { mergeMap } from '../../../operators/mergeMap';
import { defaultOptions } from '../defaultOptions';

/**
 * Request has polymorphic overload allows (url, config) form, build requestConfig via given params.
 *
 * @param urlOrConfig
 * @param config
 */
const buildConfig = (urlOrConfig: RequestConfig | string, config?: RequestConfig): RequestConfig => {
  const baseConfig = (isString(urlOrConfig) ? config : urlOrConfig) || {};
  if (isString(urlOrConfig)) {
    baseConfig.url = urlOrConfig;
  }

  return {
    ...baseConfig,
    url: isString(urlOrConfig) ? urlOrConfig : baseConfig.url,
    method: baseConfig.method ? (baseConfig.method.toLowerCase() as Method) : Method.Get
  };
};

type requestMethodType = <T>(url: string, config?: RequestConfig) => Observable<HttpEvent<T>>;
type requestMethodWithDataType = <T, U>(url: string, data?: T, config?: RequestConfig) => Observable<HttpEvent<U>>;

class Ajax {
  public readonly delete: requestMethodType;
  public readonly get: requestMethodType;
  public readonly head: requestMethodType;
  public readonly options: requestMethodType;

  public readonly post: requestMethodWithDataType;
  public readonly put: requestMethodWithDataType;
  public readonly patch: requestMethodWithDataType;

  public readonly interceptors: {
    request: Array<{ next: (config: RequestConfig) => RequestConfig; error: (err: HttpErrorResponse) => any }>;
    response: Array<{
      next: <T = any, U = T>(response: HttpEvent<T>) => HttpEvent<U>;
      error: (err: HttpErrorResponse) => any;
    }>;
  } = {
      request: [],
      response: []
    };

  constructor(private readonly baseConfig: RequestConfig) {
    [Method.Delete, Method.Get, Method.Head, Method.Options].forEach(
      (method: any) => (this[method] = (url: string, config: RequestConfig) => this.request({ ...config, method, url }))
    );

    [Method.Post, Method.Put, Method.Patch].forEach(
      (method: any) =>
        (this[method] = (url: string, data: any, config: RequestConfig) =>
          this.request({ ...config, data, method, url }))
    );
  }

  public request<T extends object | string = any>(url: string, config?: RequestConfig): Observable<HttpEvent<T>>;
  public request<T extends object | string = any>(url: string): Observable<HttpEvent<T>>;
  public request<T extends object | string = any>(config: RequestConfig): Observable<HttpEvent<T>>;
  public request<T extends object | string = any>(
    urlOrConfig: RequestConfig | string,
    config?: RequestConfig
  ): Observable<HttpEvent<T>> {
    const mergedConfig: RequestConfig = {
      ...this.baseConfig,
      ...buildConfig(urlOrConfig, config)
    };

    const { request, response } = this.interceptors;
    const buildInterceptorOperators = (interceptors: Array<any>) =>
      interceptors.reduce(
        (acc, { next, error }) => {
          acc.push(map(next));
          acc.push(catchError(err => throwError(error(err))));
          return acc;
        },
        [] as any
      );

    //https://github.com/ReactiveX/rxjs/issues/3989
    return (of(mergedConfig).pipe as any)(
      ...buildInterceptorOperators(request),
      mergeMap(value => dispatchRequest<T>(value)),
      ...buildInterceptorOperators(response)
    );
  }

  public getUri(config: RequestConfig) {
    const { url, params, paramsSerializer } = {
      ...this.baseConfig,
      ...buildConfig(config)
    };

    if (!url) {
      throw new Error(`Invalid request configuration`);
    }

    return buildURL(url, params, paramsSerializer).replace(/^\?/, '');
  }
}

/**
 * Static creation method
 */
const create = (config: RequestConfig = defaultOptions) => new Ajax(config);

export { Ajax, create, requestMethodType, requestMethodWithDataType };
