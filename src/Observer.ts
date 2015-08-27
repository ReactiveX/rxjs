import noop from './util/noop';
import throwError from './util/throwError';
import tryOrOnError from './util/tryOrOnError';

interface Observer<T> {
  next(value: T): void;
  error(err?: any): void;
  complete(): void;
  isUnsubscribed: boolean;
}

export default Observer;