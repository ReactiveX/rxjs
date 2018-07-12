import { Teardown, SubscriptionLike } from './types';
import { noop } from './util/noop';
import { isSubscription } from './util/isSubscription';

export enum SubsCmd {
  UNSUBSCRIBE = 0,
  ADD = 1,
  REMOVE = 2,
}

export interface Subscription {
  unsubscribe(): void;
  add(...teardowns: Teardown[]): void;
  remove(...teardowns: Teardown[]): void;
}

export interface SubscriptionConstructor {
  new(): Subscription;
  new(...teardowns: Teardown[]): Subscription;
}

export interface SubscriptionContext {
  _teardowns: Teardown[];
  _closed: boolean;
}

export const Subscription: SubscriptionConstructor = function Subscription(this: SubscriptionContext, ...teardowns: Teardown[]) {
  this._teardowns = teardowns;
  this._closed = false;
} as any;

Subscription.prototype.add = function (...teardowns: Teardown[]) {
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

Subscription.prototype.remove = function (...teardowns: Teardown[]) {
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

Subscription.prototype.unsubscribe = function () {
  if (!this._closed) {
    this._closed = true;
    const { _teardowns } = this;
    while (_teardowns.length > 0) {
      teardownToFunction(_teardowns.shift())();
    }
  }
};

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
