import { tap } from '../tap';
import { EmptyError } from '../../error/EmptyError';

export function throwIfEmpty<T>(errorFactory: (() => any) = defaultErrorFactory) {
  return tap<T>({
    hasValue: false,
    next() { this.hasValue = true; },
    complete() {
      if (!this.hasValue) {
        throw errorFactory();
      }
    }
  });
}

function defaultErrorFactory() {
  return new EmptyError();
}
