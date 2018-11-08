import { TeardownLogic } from 'rxjs/internal/types';
import { noop } from 'rxjs/internal/util/noop';
import { isSubscription } from 'rxjs/internal/util/isSubscription';
import { tryUserFunction, resultIsError } from './util/userFunction';
import { UnsubscriptionError } from './util/UnsubscriptionError';

export interface Subscription {
  unsubscribe(): void;
  add(...teardowns: TeardownLogic[]): void;
  remove(...teardowns: TeardownLogic[]): void;
  readonly closed: boolean;
}

export interface SubscriptionConstructor {
  new(): Subscription;
  new(...teardowns: TeardownLogic[]): Subscription;
  EMPTY: Subscription;
}

export interface SubscriptionContext {
  _teardowns: TeardownLogic[];
  _closed: boolean;
}

export const Subscription: SubscriptionConstructor = function Subscription(this: SubscriptionContext, ...teardowns: TeardownLogic[]) {
  this._teardowns = teardowns;
  this._closed = false;
} as any;

const EMPTY_SUBSCRIPTION = new Subscription();
(EMPTY_SUBSCRIPTION as any)._closed = true;

Subscription.EMPTY = EMPTY_SUBSCRIPTION;

const subscriptionProto = Subscription.prototype;

subscriptionProto.add = function (...teardowns: TeardownLogic[]) {
  const { _teardowns } = this;
  for (let teardown of teardowns) {
    if (teardown) {
      if (this._closed) {
        teardownToFunction(teardown)();
      } else {
        if (isSubscription(teardown)) {
          teardown.add(() => this.remove(teardown));
        }
        _teardowns.push(teardown);
      }
    }
  }
};

subscriptionProto.remove = function (...teardowns: TeardownLogic[]) {
  const { _teardowns } = this;
  for (let teardown of teardowns) {
    if (teardown) {
      const i = _teardowns.indexOf(teardown);
      if (i >= 0) {
        _teardowns.splice(i, 1);
      }
    }
  }
};

subscriptionProto.unsubscribe = function () {
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
};

Object.defineProperty(subscriptionProto, 'closed', {
  get() {
    return this._closed;
  },
});

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
