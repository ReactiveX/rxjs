import { XSSI_PREFIX } from './base';

/**
 * Parse given body as json object if responseType is configured
 */
const parseJsonResponse = (status: number, body: any) => {
  // ok determines whether the response will be transmitted on the event or
  // error channel. Unsuccessful status codes (not 2xx) will always be errors,
  // but a successful status code can still result in an error if the user
  // asked for JSON data and the body cannot be parsed as such.
  const ok = status >= 200 && status < 300;

  // Save the original body, before attempting XSSI prefix stripping.
  const originalBody = body;
  let ret = body.replace(XSSI_PREFIX, '');
  try {
    // Attempt the parse. If it fails, a parse error should be delivered to the user.
    ret = ret !== '' ? JSON.parse(ret) : null;
    return { ok, body: ret };
  } catch (error) {
    // Since the JSON.parse failed, it's reasonable to assume this might not have been a
    // JSON response. Restore the original body (including any XSSI prefix) to deliver
    // a better error response.
    ret = originalBody;

    // If this was an error request to begin with, leave it as a string, it probably
    // just isn't JSON. Otherwise, deliver the parsing error to the user.
    if (ok) {
      // Even though the response status was 2xx, this is still an error.
      // The parse error contains the text of the body that failed to parse.
      ret = { error, text: ret };
    }

    return { ok: false, body: ret };
  }
};

export { parseJsonResponse };