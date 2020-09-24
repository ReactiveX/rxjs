/** @prettier */

/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}
