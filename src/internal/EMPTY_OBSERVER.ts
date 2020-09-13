import { Observer } from './types';
import { config } from './config';
import { reportUnhandledError } from './util/reportUnhandledError';
import { noop } from './util/noop';

/**
 * The observer used as a stub for subscriptions where the user did not
 * pass any arguments to `subscribe`. Comes with the default error handling
 * behavior.
 */
export const EMPTY_OBSERVER: Readonly<Observer<any>> = {
  closed: true,
  next: noop,
  error(err: any): void {
    if (config.useDeprecatedSynchronousErrorHandling) {
      throw err;
    } else {
      reportUnhandledError(err);
    }
  },
  complete: noop
};
