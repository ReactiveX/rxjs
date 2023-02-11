/**
 * Gets what should be in the `response` property of the XHR.
 *
 * This is used both in creating an AjaxResponse, and in creating certain errors
 * that we throw, so we can give the user whatever was in the response property.
 *
 * @param xhr The XHR to examine the response of
 */
export function getXHRResponse(xhr: XMLHttpRequest) {
  return xhr.responseType === 'document' ? xhr.responseXML : xhr.response;
}
