import {Observable} from '../../dist/cjs/Observable';
import {SubscriptionLog} from '../../dist/cjs/testing/SubscriptionLog';
import {ColdObservable} from '../../dist/cjs/testing/ColdObservable';
import {HotObservable} from '../../dist/cjs/testing/HotObservable';
import {TestScheduler, observableToBeFn, subscriptionLogsToBeFn} from '../../dist/cjs/testing/TestScheduler';

declare const global: any;

export const rxTestScheduler: TestScheduler = global.rxTestScheduler;

export function hot(marbles: string, values?: void, error?: any): HotObservable<string>;
export function hot<V>(marbles: string, values?: { [index: string]: V; }, error?: any): HotObservable<V>;
export function hot<V>(marbles: string, values?: { [index: string]: V; } | void, error?: any): HotObservable<any> {
  if (!global.rxTestScheduler) {
    throw 'tried to use hot() in async test';
  }
  return global.rxTestScheduler.createHotObservable.apply(global.rxTestScheduler, arguments);
}

export function cold(marbles: string, values?: void, error?: any): ColdObservable<string>;
export function cold<V>(marbles: string, values?: { [index: string]: V; }, error?: any): ColdObservable<V>;
export function cold<V>(marbles: string, values?: { [index: string]: V; } | void, error?: any): ColdObservable<V> {
  if (!global.rxTestScheduler) {
    throw 'tried to use cold() in async test';
  }
  return global.rxTestScheduler.createColdObservable.apply(global.rxTestScheduler, arguments);
}

export function expectObservable(observable: Observable<any>,
                                 unsubscriptionMarbles: string = null): ({ toBe: observableToBeFn }) {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectObservable() in async test';
  }
  return global.rxTestScheduler.expectObservable.apply(global.rxTestScheduler, arguments);
}

export function expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn }) {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectSubscriptions() in async test';
  }
  return global.rxTestScheduler.expectSubscriptions.apply(global.rxTestScheduler, arguments);
}

export function time(marbles: string): number {
  if (!global.rxTestScheduler) {
    throw 'tried to use time() in async test';
  }
  return global.rxTestScheduler.createTime.apply(global.rxTestScheduler, arguments);
}