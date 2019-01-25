import { TeardownLogic } from 'rxjs/internal/types';
import { tryUserFunction, resultIsError } from './util/userFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
import { isSubscription } from 'rxjs/internal/util/isSubscription';
export class Subscription {
  private _teardowns: (() => void)[] = [];
  private _closed = false;

  constructor(teardown?: TeardownLogic) {
    if (teardown) {
      this.add(teardown);
    }
  }

  get closed() {
    return this._closed;
  }

  unsubscribe() {
    if (!this._closed) {
      this._closed = true;
      this._unsubscribe();
    }
  }

  private _unsubscribe() {
    const _teardowns = this._teardowns.slice();
    let errors = undefined;
    while (_teardowns.length > 0) {
      const teardown = _teardowns.shift();
      const result = tryUserFunction(teardown);
      if (resultIsError(result)) {
        const err = result.error;
        errors = errors || [];
        if (err instanceof UnsubscriptionError) {
          errors.push(...err.errors);
        } else {
          errors.push(err);
        }
      }
    }
    if (errors) {
      throw new UnsubscriptionError(errors);
    }
  }

  add(teardownLogic: TeardownLogic) {
    if (!teardownLogic || teardownLogic === this) {
      return;
    }
    let teardown: () => void;
    if (isSubscription(teardownLogic)) {
      if (this._closed) {
        teardownLogic.unsubscribe();
        return;
      } else {
        teardown = () => teardownLogic.unsubscribe();
        teardownLogic.add(() => {
          const _teardowns = this._teardowns;
          const index = _teardowns.indexOf(teardown);
          if (index >= 0) {
            _teardowns.splice(index, 1);
          }
        });
      }
    } else if (typeof teardownLogic === 'function') {
      teardown = teardownLogic as () => void;
      if (this._closed) {
        teardown();
        return;
      }
    } else {
      return;
    }
    this._teardowns.push(teardown);
  }
}
