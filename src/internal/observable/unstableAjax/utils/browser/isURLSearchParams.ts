import { root } from '../../../../util/root';

const isURLSearchParams = (val: unknown) => {
  const rootCtor = root.URLSearchParams;
  const rootCtorDefined = typeof rootCtor !== 'undefined';

  return rootCtorDefined && val instanceof rootCtor;
};

export { isURLSearchParams };