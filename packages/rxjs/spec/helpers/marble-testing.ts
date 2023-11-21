import type { Observable } from 'rxjs';
import type { SubscriptionLog } from '../../src/internal/testing/subscription-logging';
import type { ColdObservable } from '../../src/internal/testing/ColdObservable';
import type { HotObservable } from '../../src/internal/testing/HotObservable';
import type { observableToBeFn, subscriptionLogsToBeFn } from '../../src/internal/testing/TestScheduler';

declare const global: any;

export function hot(marbles: string, values?: void, error?: any): HotObservable<string>;
export function hot<V>(marbles: string, values?: { [index: string]: V }, error?: any): HotObservable<V>;
export function hot<V>(marbles: string, values?: { [index: string]: V } | void, error?: any): HotObservable<any> {
  if (!global.rxTestScheduler) {
    throw 'tried to use hot() in async test';
  }
  return global.rxTestScheduler.createHotObservable.call(global.rxTestScheduler, marbles, values, error);
}

export function cold(marbles: string, values?: void, error?: any): ColdObservable<string>;
export function cold<V>(marbles: string, values?: { [index: string]: V }, error?: any): ColdObservable<V>;
export function cold(marbles: string, values?: any, error?: any): ColdObservable<any> {
  if (!global.rxTestScheduler) {
    throw 'tried to use cold() in async test';
  }
  return global.rxTestScheduler.createColdObservable.call(global.rxTestScheduler, marbles, values, error);
}

export function expectObservable(observable: Observable<any>, unsubscriptionMarbles: string | null = null): { toBe: observableToBeFn } {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectObservable() in async test';
  }
  return global.rxTestScheduler.expectObservable.call(global.rxTestScheduler, observable, unsubscriptionMarbles);
}

export function expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): { toBe: subscriptionLogsToBeFn } {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectSubscriptions() in async test';
  }
  return global.rxTestScheduler.expectSubscriptions.call(global.rxTestScheduler, actualSubscriptionLogs);
}

export function time(marbles: string): number {
  if (!global.rxTestScheduler) {
    throw 'tried to use time() in async test';
  }
  return global.rxTestScheduler.createTime.call(global.rxTestScheduler, marbles);
}
