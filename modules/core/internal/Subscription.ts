import { Subs, FOType, Teardown } from './types';

export interface Subscription extends Subs {
  unsubscribe();
}

export interface SubscriptionConstructor {
  new(teardown?: Teardown): Subscription;
}

export function createSubs(teardown?: () => void): Subs {
  return (type: FOType.COMPLETE, _: void) => {
    if (teardown) {
      teardown();
    }
  };
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

function unsubscribe(this: Subscription) {
  this(FOType.COMPLETE, undefined);
}
