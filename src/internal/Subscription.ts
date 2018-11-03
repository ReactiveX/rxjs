import { TeardownLogic } from 'rxjs/internal/types';
import { noop } from 'rxjs/internal/util/noop';
import { isSubscription } from 'rxjs/internal/util/isSubscription';

export interface Subscription {
  unsubscribe(): void;
  add(...teardowns: TeardownLogic[]): void;
  remove(...teardowns: TeardownLogic[]): void;
  readonly closed: boolean;
}

export interface SubscriptionConstructor {
  new(): Subscription;
  new(...teardowns: TeardownLogic[]): Subscription;
}

export interface SubscriptionContext {
  _teardowns: TeardownLogic[];
  _closed: boolean;
}

export const Subscription: SubscriptionConstructor = function Subscription(this: SubscriptionContext, ...teardowns: TeardownLogic[]) {
  this._teardowns = teardowns;
  this._closed = false;
} as any;

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
}

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
    while (_teardowns.length > 0) {
      teardownToFunction(_teardowns.shift())();
    }
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
