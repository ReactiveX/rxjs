import { Teardown, SubscriptionLike } from './types';
import { noop } from './util/noop';

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

interface SubscriptionContext {
  _teardowns: Teardown[];
}

export const Subscription: SubscriptionConstructor = function Subscription(this: SubscriptionContext, ...teardowns: Teardown[]) {
  this._teardowns = teardowns;
} as any;

Subscription.prototype.add = function (...teardowns: Teardown[]) {
  const { _teardowns } = this;
  for (let teardown of teardowns) {
    if (teardown) _teardowns.push(teardown);
  }
}

Subscription.prototype.remove = function (...teardowns: Teardown[]) {
  const { _teardowns } = this;
  for (let teardown of teardowns) {
    if (teardown) {
      const i = _teardowns.indexOf(teardown);
      if (i < 0) {
        _teardowns.splice(i, 1);
      }
    }
  }
};

Subscription.prototype.unsubscribe = function () {
  const { _teardowns } = this;
  while (_teardowns.length > 0) {
    teardownToFunction(_teardowns.shift())();
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
