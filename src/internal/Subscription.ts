import { TeardownLogic } from 'rxjs/internal/types';
import { noop } from 'rxjs/internal/util/noop';
import { isSubscription } from 'rxjs/internal/util/isSubscription';
import { tryUserFunction, resultIsError } from './util/userFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
export class Subscription {
  protected _teardowns: TeardownLogic[];
  protected _closed = false;

  get closed() {
    return this._closed;
  }

  constructor(...teardowns: TeardownLogic[]) {
    this._teardowns = teardowns;
  }

  add(...teardowns: TeardownLogic[]) {
    const { _teardowns, _closed } = this;
    for (let teardown of teardowns) {
      if (teardown) {
        if (_closed) {
          teardownToFunction(teardown)();
        } else {
          if (isSubscription(teardown)) {
            teardown.add(() => this.remove(teardown));
          }
          _teardowns.push(teardown);
        }
      }
    }
  }

  remove(...teardowns: TeardownLogic[]) {
    const { _teardowns } = this;
    for (let teardown of teardowns) {
      if (teardown) {
        const i = _teardowns.indexOf(teardown);
        if (i >= 0) {
          _teardowns.splice(i, 1);
        }
      }
    }
  }

  unsubscribe() {
    if (!this._closed) {
      this._closed = true;
      const { _teardowns } = this;
      let unsubError: UnsubscriptionError;

      while (_teardowns.length > 0) {
        const result = tryUserFunction(teardownToFunction(_teardowns.shift()));
        if (resultIsError(result)) {
          const err = result.error;
          unsubError = unsubError || new UnsubscriptionError(err instanceof UnsubscriptionError ? err.errors : []);
          unsubError.errors.push(err);
        }
      }
      if (unsubError) { throw unsubError; }
    }
  }
}

export function teardownToFunction(teardown: any): () => void {
  if (teardown) {
    if (typeof teardown.unsubscribe === 'function') {
      return () => teardown.unsubscribe();
    } else if (typeof teardown === 'function') {
      return teardown;
    }
  }
  return noop;
}
