import * as Rx from '../../dist/cjs/Rx.KitchenSink';
declare const {time, expectObservable};

declare const rxTestScheduler: Rx.TestScheduler;

const Observable = Rx.Observable;

/** @test {timer} */
describe('Observable.timer', () => {
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
