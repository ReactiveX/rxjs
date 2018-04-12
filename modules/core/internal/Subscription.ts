import { Teardown, SubscriptionLike } from './types';
import { noop } from './util/noop';

export enum SubsCmd {
  UNSUBSCRIBE = 0,
  ADD = 1,
  REMOVE = 2,
}

export interface FSubs {
  (): void;
  (type: SubsCmd.UNSUBSCRIBE): void;
  (type: SubsCmd.ADD, teardowns: Teardown[]): void;
  (type: SubsCmd.REMOVE, teardowns: Teardown[]): void;
  (type: SubsCmd, teardowns?: Teardown[]): void;
}

export interface Subscription extends FSubs {
  unsubscribe(): void;
  add(...teardowns: Teardown[]): void;
  remove(...teardowns: Teardown[]): void;
}

export interface SubscriptionConstructor {
  new(): Subscription;
  new(...teardowns: Teardown[]): Subscription;
}

function executeTeardown(teardown: Teardown) {
  if (typeof (teardown as SubscriptionLike).unsubscribe === 'function') {
    (teardown as SubscriptionLike).unsubscribe();
  } else if (typeof teardown === 'function') {
    teardown();
  }
}

export const Subscription: SubscriptionConstructor = function (...teardowns: Teardown[]) {
  let childSubs: (() => void)[];
  const result = ((cmd: SubsCmd, teardowns?: Teardown[]) => {
    switch (cmd) {
      case SubsCmd.ADD:
        childSubs = (childSubs || []);
        for (const teardown of teardowns) {
          if (teardown) {
            childSubs.push(teardownToFunction(teardown));
          }
        }
        break;
      case SubsCmd.REMOVE:
        if (childSubs) {
          for (const teardown of teardowns) {
            const i = childSubs.indexOf(teardownToFunction(teardown));
            if (i > -1) {
              childSubs.splice(i, 1);
            }
          }
        }
        break;
      case SubsCmd.UNSUBSCRIBE:
      default:
        if (childSubs) {
          while (childSubs.length > 0) {
            childSubs.shift()();
          }
        }
        break;
    }
  }) as Subscription;

  if (teardowns.length > 0) {
    result(SubsCmd.ADD, teardowns);
  }

  (result as any).__proto__ = Subscription.prototype;
  result.unsubscribe = unsubscribe;
  result.add = add;
  result.remove = remove;
  return result;
} as any;

function unsubscribe(this: FSubs) {
  this(SubsCmd.UNSUBSCRIBE);
}

function add(this: FSubs, ...teardowns: Teardown[]): void {
  this(SubsCmd.ADD, teardowns);
}

function remove(this: FSubs, ...teardowns: Teardown[]): void {
  this(SubsCmd.REMOVE, teardowns);
}

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
