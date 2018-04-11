import { Subs, FOType, Teardown } from './types';

export interface Subscription extends Subs {
  unsubscribe(): void;
}

export interface SubscriptionConstructor {
  new(teardown?: Teardown): Subscription;
}

export function createSubs(teardown?: () => void): Subs {
  return (type: FOType.COMPLETE, _: void) => {
    if (type === FOType.COMPLETE && teardown) {
      teardown();
    }
  };
}

export function concatSubs(subs: Subs, ...teardowns: Array<() => void>) {
  return subsAsSubscription(createSubs(() => {
    subs(FOType.COMPLETE, undefined);
    for (const teardown of teardowns) {
      teardown();
    }
  }));
}

export const Subscription: SubscriptionConstructor = function (teardown?: () => void) {
  return subsAsSubscription(createSubs());
} as any;

export function subsAsSubscription(subs: Subs) {
  const result = subs as Subscription;
  (result as any).__proto__ = Subscription.prototype;
  result.unsubscribe = unsubscribe;
  return result;
}

function unsubscribe(this: Subscription): void {
  this(FOType.COMPLETE, undefined);
}
