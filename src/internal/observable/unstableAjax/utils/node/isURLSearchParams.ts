import { root } from '../../../../util/root';

const isURLSearchParams = (val: unknown) => {
  const rootCtor = root.URLSearchParams;
  const rootCtorDefined = typeof rootCtor !== 'undefined';

  const isBrowserSearchParamUrl = rootCtorDefined && val instanceof rootCtor;

  //tslint:disable-next-line:no-require-imports
  const urlCtor = require('url').URLSearchParams;
  const urlCtorDefined = typeof urlCtor !== 'undefined';

  return isBrowserSearchParamUrl || (urlCtorDefined && val instanceof urlCtor);
};

export { isURLSearchParams };