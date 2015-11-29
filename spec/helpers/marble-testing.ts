///<reference path='../../typings/jasmine/jasmine.d.ts'/>
import {Observable} from '../../dist/cjs/Observable';
import {SubscriptionLog} from '../../dist/cjs/testing/SubscriptionLog';
import {ColdObservable} from '../../dist/cjs/testing/ColdObservable';
import {HotObservable} from '../../dist/cjs/testing/HotObservable';
import {observableToBeFn, subscriptionLogsToBeFn} from '../../dist/cjs/testing/TestScheduler';

declare var global: any;

export function hot(marbles: string, values?: any, error?: any): HotObservable<any> {
  if (!global.rxTestScheduler) {
    throw 'tried to use hot() in async test';
  }
  return global.rxTestScheduler.createHotObservable.apply(global.rxTestScheduler, arguments);
}

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

export function assertDeepEqual(actual, expected) {
  (<any>expect(actual)).toDeepEqual(expected);
}