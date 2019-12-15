import { ISubscriber } from './types';
import { config } from './config';
import { hostReportError } from './util/hostReportError';

export const EMPTY_OBSERVER: ISubscriber<any> = {
  closed: true,
  next(): void { /* noop */},
  error(err: any): void {
    if (config.useDeprecatedSynchronousErrorHandling) {
      throw err;
    } else {
      hostReportError(err);
    }
  },
  complete(): void { /*noop*/ }
};
