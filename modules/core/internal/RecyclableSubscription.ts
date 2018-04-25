import { Subscription, SubscriptionConstructor, SubscriptionContext, teardownToFunction } from './Subscription';
import { Teardown } from './types';

export interface RecyclableSubscription extends Subscription {
  recycle(): void;
}

export interface RecyclableSubscriptionConstructor {
  new(...teardowns: Teardown[]): RecyclableSubscription;
}

export const RecyclableSubscription: RecyclableSubscriptionConstructor =
  function RecyclableSubscription(this: any, ...teardowns: Teardown[]) {
    Subscription.apply(this, teardowns);
  } as any;

RecyclableSubscription.prototype = Object.create(Subscription.prototype);

RecyclableSubscription.prototype.recycle = function (this: SubscriptionContext) {
  const { _teardowns } = this;
  while (_teardowns.length > 0) {
    teardownToFunction(_teardowns.shift())();
  }
}
