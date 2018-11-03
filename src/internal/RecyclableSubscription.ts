import { Subscription, SubscriptionContext, teardownToFunction } from 'rxjs/internal/Subscription';
import { TeardownLogic } from 'rxjs/internal/types';

export interface RecyclableSubscription extends Subscription {
  recycle(): void;
}

export interface RecyclableSubscriptionConstructor {
  new(...teardowns: TeardownLogic[]): RecyclableSubscription;
}

export const RecyclableSubscription: RecyclableSubscriptionConstructor =
  function RecyclableSubscription(this: any, ...teardowns: TeardownLogic[]) {
    Subscription.apply(this, teardowns);
  } as any;

RecyclableSubscription.prototype = Object.create(Subscription.prototype);

RecyclableSubscription.prototype.recycle = function (this: SubscriptionContext) {
  const { _teardowns } = this;
  while (_teardowns.length > 0) {
    teardownToFunction(_teardowns.shift())();
  }
}
