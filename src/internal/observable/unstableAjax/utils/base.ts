import { root } from '../../../util/root';
import { isObject } from '../../../util/isObject';
import { isFunction } from '../../../util/isFunction';

/**
 * Naïvely detect if running environment if node
 * Note this'll return true on Electron's renderer process as well
 */
const isNode = () => {
  const proc = root.process;

  if (!!proc && typeof proc === 'object') {
    if (!!proc.versions && typeof proc.versions === 'object') {
      if (typeof proc.versions.node !== 'undefined') {
        return true;
      }
    }
  }
  return false;
};

/**
 * Determine if a value is a String
 *
 * @param {any} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
const isString = (val: any): val is string => typeof val === 'string';

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
const isNumber = (val: any): val is number => typeof val === 'number';

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
const isStream = (val: any): val is import('stream').Stream => isObject(val) && isFunction(val.pipe);

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
const isArrayBuffer = (val: any): val is ArrayBuffer => toString.call(val) === '[object ArrayBuffer]';

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
const isFormData = (val: any): val is FormData => typeof FormData !== 'undefined' && val instanceof FormData;

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFile = (val: any) => toString.call(val) === '[object File]';

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
const isBlob = (val: any) => toString.call(val) === '[object Blob]';

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param unknown val The value to test
 * @returns boolean True if value is a URLSearchParams object, otherwise false
 */
const isURLSearchParams = (val: unknown) =>
  isNode()
    ? require('./node/isURLSearchParams').isURLSearchParams(val) //tslint:disable-line:no-require-imports
    : require('./browser/isURLSearchParams').isURLSearchParams(val); //tslint:disable-line:no-require-imports

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
const isStandardBrowserEnv = () => {
  //Short curcuit for node environment
  if (isNode()) {
    return false;
  }

  if (
    typeof navigator !== 'undefined' &&
    (navigator.product === 'ReactNative' || navigator.product === 'NativeScript' || navigator.product === 'NS')
  ) {
    return false;
  }
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Naïve implementation of `pick<T, U>()`.
 */
const pick = (value: Record<string, any>, props: Array<string>) =>
  props.reduce((acc, prop) => {
    if (value[prop]) {
      acc[prop] = value[prop];
    }
    return acc;
  }, {});

const XSRF_HEADER_NAME = 'X-XSRF-TOKEN';
const XSSI_PREFIX = /^\)\]\}',?\n/;

export {
  isNode,
  isFormData,
  isFile,
  isFunction,
  isBlob,
  isString,
  isObject,
  isArrayBuffer,
  isNumber,
  isStream,
  isURLSearchParams,
  isStandardBrowserEnv,
  XSRF_HEADER_NAME,
  XSSI_PREFIX,
  pick
};