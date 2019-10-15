import { Adapter, Method, RequestConfig } from './Request';
import {
  isArrayBuffer,
  isBlob,
  isFile,
  isFormData,
  isNode,
  isObject,
  isStream,
  isURLSearchParams,
  XSRF_HEADER_NAME
} from './utils/base';
import { normalizeHeaderName } from './utils/normalizeHeaderName';

const DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

const setContentTypeIfUnset = (headers: Record<string, any> | undefined, value: string) => {
  if (!!headers && !headers['Content-Type']) {
    headers['Content-Type'] = value;
  }
};

//tslint:disable-next-line:no-require-imports
const isBuffer = (val: unknown) => (isNode() ? require('./utils/node/isBuffer') : require('./utils/browser/isBuffer')).isBuffer(val);
//tslint:disable-next-line:no-require-imports
const getDefaultAdapter = (): Adapter => (isNode() ? require('./adapters/http') : require('./adapters/xhr')).adapter;

/**
 * Default validator
 *
 */
const validateStatus = (status: number) => status >= 200 && status < 300;

const defaultTransformRequest = (data: object | string, headers?: Record<string, any>) => {
  normalizeHeaderName(headers, 'Accept');
  normalizeHeaderName(headers, 'Content-Type');

  if (isFormData(data) || isArrayBuffer(data) || isBuffer(data) || isStream(data) || isFile(data) || isBlob(data)) {
    return data;
  }
  if (ArrayBuffer.isView(data)) {
    return data.buffer;
  }
  if (isURLSearchParams(data)) {
    setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
    return data.toString();
  }
  if (isObject(data)) {
    setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
    return JSON.stringify(data);
  }
  return data;
};

const defaultTransformResponse = (data: any) => {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      /* noop */
    }
  }
  return data;
};

/**
 * Default configuration values.
 */
const defaultOptions: Readonly<RequestConfig> = (() => {
  let ret = {
    adapter: getDefaultAdapter(),

    transformRequest: [defaultTransformRequest],

    transformResponse: [defaultTransformResponse],

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: XSRF_HEADER_NAME,

    maxContentLength: -1,

    validateStatus,

    headers: {
      common: {
        Accept: 'application/json, text/plain, */*'
      }
    }
  };

  [Method.Delete, Method.Get, Method.Head].forEach(method => (ret.headers[method] = {}));
  [Method.Post, Method.Put, Method.Patch].forEach(method => {
    const current = ret.headers[method] || {};
    ret.headers[method] = {
      ...current,
      ...DEFAULT_CONTENT_TYPE
    };
  });

  return Object.freeze(ret);
})();

export { defaultOptions, validateStatus };
