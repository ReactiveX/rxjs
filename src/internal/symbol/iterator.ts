
/* NOTE: Warning users that they don't have a Symbol.iterator
   polyfill. We don't want to throw on this, because it's not required
   by the library. However it will provide clues to users on older
   browsers why things like `from(iterable)` doesn't work. */
if (!Symbol || !Symbol.iterator) {
  console.warn('RxJS: Symbol.observable does not exist');
}

/** The native Symbol.iterator instance or a string */
export const iterator = Symbol && Symbol.iterator || '@@iterator';

/**
 * @deprecated use {@link iterator} instead
 */
export const $$iterator = iterator;
