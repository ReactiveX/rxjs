// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = [
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Record<string, string>} Headers parsed into an object
 */
const parseHeaders = (headers: string): Record<string, string> => {
  if (!headers) {
    return {};
  }

  return headers
    .split('\n')
    .map(line => line.split(/:(.+)/, 2).map(x => x.trim()))
    .reduce((acc, [originalKey, value]) => {
      if (!originalKey) {
        return acc;
      }

      const key = originalKey.toLowerCase();
      if (acc[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return acc;
      }

      if (key === 'set-cookie') {
        acc[key] = (acc[key] ? acc[key] : []).concat([value]);
      } else {
        acc[key] = acc[key] ? `${acc[key]}, ${value}` : value;
      }

      return acc;
    }, {});
};

export { parseHeaders };
