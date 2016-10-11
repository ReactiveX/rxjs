///<reference path='../../typings/index.d.ts'/>
import {Observable} from '../../dist/cjs/Observable';
import {SubscriptionLog} from '../../dist/cjs/testing/SubscriptionLog';
import {ColdObservable} from '../../dist/cjs/testing/ColdObservable';
import {HotObservable} from '../../dist/cjs/testing/HotObservable';
import {observableToBeFn, subscriptionLogsToBeFn} from '../../dist/cjs/testing/TestScheduler';

declare const global: any;

export function hot(_marbles: string, _values?: any, _error?: any): HotObservable<any> {
  if (!global.rxTestScheduler) {
    throw 'tried to use hot() in async test';
  }
  return global.rxTestScheduler.createHotObservable.apply(global.rxTestScheduler, arguments);
}

export function cold(_marbles: string, _values?: any, _error?: any): ColdObservable<any> {
  if (!global.rxTestScheduler) {
    throw 'tried to use cold() in async test';
  }
  return global.rxTestScheduler.createColdObservable.apply(global.rxTestScheduler, arguments);
}

export function expectObservable(_observable: Observable<any>,
                                 _unsubscriptionMarbles: string = null): ({ toBe: observableToBeFn }) {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectObservable() in async test';
  }
  return global.rxTestScheduler.expectObservable.apply(global.rxTestScheduler, arguments);
}

export function expectSubscriptions(_actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn }) {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectSubscriptions() in async test';
  }
  return global.rxTestScheduler.expectSubscriptions.apply(global.rxTestScheduler, arguments);
}

export function time(_marbles: string): number {
  if (!global.rxTestScheduler) {
    throw 'tried to use time() in async test';
  }
  return global.rxTestScheduler.createTime.apply(global.rxTestScheduler, arguments);
}