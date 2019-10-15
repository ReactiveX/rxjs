import { HttpEvent } from './Response';
import { Observable } from '../../Observable';

enum Method {
  Get = 'get',
  Delete = 'delete',
  Head = 'head',
  Options = 'options',
  Post = 'post',
  Put = 'put',
  Patch = 'patch'
}

enum ResponseType {
  ArrayBuffer = 'arraybuffer',
  Blob = 'blob',
  Document = 'document',
  Json = 'json',
  Text = 'text',
  Stream = 'stream'
}

interface BasicCredentials {
  username: string;
  password: string;
}

interface ProxyConfig {
  host: string;
  port: number;
  auth?: BasicCredentials;
  protocol?: string;
}

interface Adapter {
  <T = any>(config: RequestConfig): Observable<HttpEvent<T>>;
}

interface Transformer {
  (data: object | string, headers?: Record<string, any>): object | string;
}

interface RequestConfigBase {
  url: string;
  method: Method;
  baseURL: string;
  transformRequest: Transformer | Array<Transformer>;
  transformResponse: Transformer | Array<Transformer>;
  headers: Record<string, any>;
  params: any;
  paramsSerializer: (params: any) => string;
  data: any;
  adapter: Adapter;
  auth: BasicCredentials;
  responseType: ResponseType;
  responseEncoding: string;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  validateStatus: (status: number) => boolean;
  maxRedirects: number;
  socketPath: string;
  proxy: ProxyConfig;
}

interface RequestConfigNode extends Partial<RequestConfigBase> {
  /**
   * Custom agent to be used in node http request.
   */
  httpAgent?: any;
  /**
   * Custom agent to be used in node https request.
   */
  httpsAgent?: any;
  /**
   * Custom transport to be used in request.
   * Note: `transport.request` should implement `typeof import('http').request`,
   * while doesn't strictly enforce types in here to avoid dependency to `@types/node`.
   */
  transport?: { request: Function };
}

interface RequestConfigXHR extends Partial<RequestConfigBase> {
  /**
   * Emit progress event for xhr request.
   */
  reportProgress?: boolean;
  withCredentials?: boolean;
}

/**
 * Union type of RequestConfig for node / xhr.
 */
type RequestConfig = RequestConfigNode | RequestConfigXHR;

export {
  Method,
  ResponseType,
  RequestConfigNode,
  RequestConfigXHR,
  RequestConfig,
  ProxyConfig,
  Adapter,
  Transformer,
  BasicCredentials
};

