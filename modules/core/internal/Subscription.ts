import { Subs, FOType, Teardown, SubscriptionLike } from './types';

export interface Subscription extends Subs {
  unsubscribe(): void;
  add(teardown?: Teardown): void;
  remove(teardown?: Teardown): void;
}

export interface SubscriptionConstructor {
  new(teardown?: Teardown): Subscription;
}

function executeTeardown(teardown: Teardown) {
  if (typeof (teardown as SubscriptionLike).unsubscribe === 'function') {
    (teardown as SubscriptionLike).unsubscribe();
  } else if (typeof teardown === 'function') {
    teardown();
  }
}

export const Subscription: SubscriptionConstructor = function (teardown?: Teardown) {
  let childSubs: Teardown[];
  const result = ((type: FOType, arg: Teardown|void) => {
    switch (type) {
      case FOType.COMPLETE:
        if (teardown) {
          executeTeardown(teardown);
        }
        if (childSubs) {
          while (childSubs.length > 0) {
            executeTeardown(childSubs.shift());
          }
        }
        break;
      case FOType.ADD:
        childSubs = (childSubs || []);
        childSubs.push(arg);
        break;
      case FOType.REMOVE:
        if (childSubs) {
          const i = childSubs.indexOf(arg);
          if (i > -1) {
            childSubs.splice(i, 1);
          }
        }
        break;
      default:
    }
    if (type === FOType.COMPLETE && teardown) {
      if ((teardown as SubscriptionLike).unsubscribe) {
        (teardown as SubscriptionLike).unsubscribe();
      }
    }
  }) as Subscription;

  (result as any).__proto__ = Subscription.prototype;
  result.unsubscribe = unsubscribe;
  result.add = add;
  result.remove = remove;
  return result;
} as any;

function unsubscribe(this: Subscription): void {
  this(FOType.COMPLETE, undefined);
}

function add(this: Subscription, teardown: Teardown) {
  if (teardown) {
    this(FOType.ADD, teardown);
  }
}

function remove(this: Subscription, teardown: Teardown) {
  if (teardown) {
    this(FOType.REMOVE, teardown);
  }
}
