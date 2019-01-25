import { TeardownLogic } from 'rxjs/internal/types';
import { tryUserFunction, resultIsError } from './util/userFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';
import { isSubscription } from 'rxjs/internal/util/isSubscription';
export class Subscription {
  private _teardowns: (() => void)[] = [];
  private _closed = false;

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
    const _teardowns = this._teardowns;
    let errors = undefined;
    while (_teardowns.length > 0) {
      const teardown = _teardowns.shift();
      debugger;
      const result = tryUserFunction(teardown);
      if (resultIsError(result)) {
        const err = result.error;
        errors = errors || [];
        if (err instanceof UnsubscriptionError) {
          errors.push(...err.errors);
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
      teardown = () => teardownLogic.unsubscribe();
      teardownLogic.add(() => {
        const _teardowns = this._teardowns;
        const index = _teardowns.indexOf(teardown);
        if (index >= 0) {
          _teardowns.splice(index, 1);
        }
      });
    }
    this._teardowns.push(teardown);
  }
}
