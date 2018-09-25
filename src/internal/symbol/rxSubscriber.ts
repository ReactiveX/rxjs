/** @deprecated do not use, this is no longer checked by RxJS internals */
export const rxSubscriber =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('rxSubscriber')
    : '@@rxSubscriber';

/**
 * @deprecated use rxSubscriber instead
 */
export const $$rxSubscriber = rxSubscriber;
