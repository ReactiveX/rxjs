import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { SubscriptionLog } from '../../src/internal/testing/SubscriptionLog';
import { ColdObservable } from '../../src/internal/testing/ColdObservable';
import { HotObservable } from '../../src/internal/testing/HotObservable';
import { observableToBeFn, subscriptionLogsToBeFn } from '../../src/internal/testing/TestScheduler';

declare const global: any;

export const emptySubs: any[] = [];

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
export function cold(marbles: string, values?: any, error?: any): ColdObservable<any> {
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
