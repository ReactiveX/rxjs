import * as Rx from '../../dist/cjs/Rx';

import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const rxTestScheduler: Rx.TestScheduler;

const Observable = Rx.Observable;

/** @test {timer} */
describe('Observable.timer', () => {
  asDiagram('timer(3000, 1000)')('should create an observable emitting periodically', () => {
    const e1 = Observable.timer(60, 20, rxTestScheduler)
      .take(4) // make it actually finite, so it can be rendered
      .concat(Observable.never()); // but pretend it's infinite by not completing
    const expected = '------a-b-c-d-';
    const values = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    };
    expectObservable(e1).toBe(expected, values);
  });

  it('should schedule a value of 0 then complete', () => {
    const dueTime = time('-----|');
    const expected =     '-----(x|)';

    const source = Observable.timer(dueTime, undefined, rxTestScheduler);
    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should emit a single value immediately', () => {
    const dueTime = time('|');
    const expected =     '(x|)';

    const source = Observable.timer(dueTime, rxTestScheduler);
    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should start after delay and periodically emit values', () => {
    const dueTime = time('----|');
    const period  = time(    '--|');
    const expected =     '----a-b-c-d-(e|)';

    const source = Observable.timer(dueTime, period, rxTestScheduler).take(5);
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should start immediately and periodically emit values', () => {
    const dueTime = time('|');
    const period  = time('---|');
    const expected =     'a--b--c--d--(e|)';

    const source = Observable.timer(dueTime, period, rxTestScheduler).take(5);
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should stop emiting values when subscription is done', () => {
    const dueTime = time('|');
    const period  = time('---|');
    const expected = 'a--b--c--d--e';
    const unsub   =  '^            !';

    const source = Observable.timer(dueTime, period, rxTestScheduler);
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source, unsub).toBe(expected, values);
  });

  it('should schedule a value at a specified Date', () => {
    const offset = time('----|');
    const expected =    '----(a|)';

    const dueTime = new Date(rxTestScheduler.now() + offset);
    const source = Observable.timer(dueTime, null, rxTestScheduler);
    expectObservable(source).toBe(expected, {a: 0});
  });

  it('should start after delay and periodically emit values', () => {
    const offset = time('----|');
    const period = time(    '--|');
    const expected =    '----a-b-c-d-(e|)';

    const dueTime = new Date(rxTestScheduler.now() + offset);
    const source = Observable.timer(dueTime, period, rxTestScheduler).take(5);
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });
});
