import { RequestConfig } from '../Request';
import { HttpResponse } from '../Response';
import { pick } from './base';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
const enhanceError = (
  error: Error & Record<string, any>,
  config?: object,
  code?: string | null,
  request?: object,
  response?: object
): Error &
  Partial<{
    config: RequestConfig;
    code: string;
    request: any;
    response: HttpResponse<any>;
  }> & { toJSON: () => Record<string, any> } => {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;

  Object.defineProperty(error, 'toJSON', {
    value: () =>
      pick(error, [
        'message',
        'name',
        'description',
        'number',
        'fileName',
        'lineNumber',
        'columnNumber',
        'stack',
        'config',
        'code'
      ])
  });

  return error as any;
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
const createError = (
  message: string,
  config?: object,
  code?: string | null,
  request?: object,
  response?: object
): ReturnType<typeof enhanceError> => enhanceError(new Error(message), config, code, request, response);

export { createError, enhanceError };