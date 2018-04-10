import { FSub, SubscriptionLike } from '../types';

export function fSubToSubscription(subs: FSub): SubscriptionLike {
  return {
    unsubscribe() {
      subs();
    }
  };
}
