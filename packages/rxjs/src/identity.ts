import '@rxjs/observable-polyfill';

/**
 * Returns the value passed as its first argument.
 */
export function identity<T>(value: T): T {
  return value;
}
