import { cold, expectObservable, time } from '../helpers/marble-testing';
import { timer, NEVER, merge } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { mergeMap, take, concat } from 'rxjs/operators';

declare const asDiagram: any;
declare const rxTestScheduler: TestScheduler;

/** @test {timer} */
describe('timer', () => {
  asDiagram('timer(3000, 1000)')('should create an observable emitting periodically', () => {
    const e1 = timer(60, 20, rxTestScheduler).pipe(
      take(4), // make it actually finite, so it can be rendered
      concat(NEVER) // but pretend it's infinite by not completing
    );
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

    const source = timer(dueTime, undefined, rxTestScheduler);
    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should emit a single value immediately', () => {
    const dueTime = time('|');
    const expected =     '(x|)';

    const source = timer(dueTime, rxTestScheduler);
    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should start after delay and periodically emit values', () => {
    const dueTime = time('----|');
    const period  = time(    '--|');
    const expected =     '----a-b-c-d-(e|)';

    const source = timer(dueTime, period, rxTestScheduler).pipe(take(5));
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should start immediately and periodically emit values', () => {
    const dueTime = time('|');
    const period  = time('---|');
    const expected =     'a--b--c--d--(e|)';

    const source = timer(dueTime, period, rxTestScheduler).pipe(take(5));
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should stop emiting values when subscription is done', () => {
    const dueTime = time('|');
    const period  = time('---|');
    const expected = 'a--b--c--d--e';
    const unsub   =  '^            !';

    const source = timer(dueTime, period, rxTestScheduler);
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source, unsub).toBe(expected, values);
  });

  it('should schedule a value at a specified Date', () => {
    const offset = time('----|');
    const expected =    '----(a|)';

    const dueTime = new Date(rxTestScheduler.now() + offset);
    const source = timer(dueTime, null, rxTestScheduler);
    expectObservable(source).toBe(expected, {a: 0});
  });

  it('should start after delay and periodically emit values', () => {
    const offset = time('----|');
    const period = time(    '--|');
    const expected =    '----a-b-c-d-(e|)';

    const dueTime = new Date(rxTestScheduler.now() + offset);
    const source = timer(dueTime, period, rxTestScheduler).pipe(take(5));
    const values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should still target the same date if a date is provided even for the ' +
    'second subscription', () => {
      const offset = time('----|    ');
      const t1 = cold(    'a|       ');
      const t2 = cold(    '--a|     ');
      const expected =    '----(aa|)';

      const dueTime = new Date(rxTestScheduler.now() + offset);
      const source = timer(dueTime, null, rxTestScheduler);

      const testSource = merge(t1, t2).pipe(
        mergeMap(() => source)
      );

      expectObservable(testSource).toBe(expected, {a: 0});
  });
});
