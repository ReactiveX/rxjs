import * as Rx from '../../dist/cjs/Rx';
import '../../dist/cjs/add/observable/generateRelativeTime';
import {TestScheduler} from '../../dist/cjs/testing/TestScheduler';
import {expect} from 'chai';
declare const {asDiagram, time, expectObservable};
declare const rxTestScheduler: TestScheduler;

const Observable = Rx.Observable;

function err(): any {
  throw 'error';
}

describe('Observable.generateRelativeTime', () => {
  it('should complete if condition does not meet', () => {
    const source = Observable.generateRelativeTime(1, x => false, x => x + 1, x => 0, rxTestScheduler);
    const expected = '|';

    expectObservable(source).toBe(expected);
  });

  it('should produce first value immediately', () => {
    const source = Observable.generateRelativeTime(1, x => x == 1, x => x + 1, x => 0, rxTestScheduler);
    const expected = '(1|)';

    expectObservable(source).toBe(expected, { '1': 1 });
  });

  it('should produce all values synchronously', () => {
    const source = Observable.generateRelativeTime(1, x => x < 3, x => x + 1, x => 0, rxTestScheduler);
    const expected = '(12|)';

    expectObservable(source).toBe(expected, { '1': 1, '2': 2 });
  });

  it('should use result selector !!!', () => {
    const source = Observable.generateRelativeTime(1, x => x < 3, x => x + 1, x => (x + 1).toString(), x => 0,  rxTestScheduler);
    const expected = '(23|)';

    expectObservable(source).toBe(expected);
  });

  it('should allow omit condition', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: x => x + 1,
      timeSelector: x => 0,
      resultSelector: x => x.toString(),
      scheduler: rxTestScheduler
    }).take(5);
    const expected = '(12345|)';

    expectObservable(source).toBe(expected);
  });

  it('should stop producing when unsubscribed', () => {
    const source = Observable.generateRelativeTime(1, x => x < 4, x => x + 1, x => 0, rxTestScheduler);
    let count = 0;
    const subscriber = new Rx.Subscriber<number>(
      x => {
        count++;
        if (x == 2) {
          subscriber.unsubscribe();
        }
      }
    );
    source.subscribe(subscriber);
    rxTestScheduler.flush();
    expect(count).to.be.equal(2);
  });

  it('should accept a scheduler', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      condition: x => x < 4,
      iterate: x => x + 1,
      timeSelector: x => 0,
      resultSelector: x => x,
      scheduler: rxTestScheduler
    });
    const expected = '(123|)';

    let count = 0;
    source.subscribe(x => count++);

    expect(count).to.be.equal(0);
    rxTestScheduler.flush();
    expect(count).to.be.equal(3);

    expectObservable(source).toBe(expected, { '1': 1, '2': 2, '3': 3 });
  });

  it('should allow minimal possible options', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: x => x * 2,
      timeSelector: x => 0,
      scheduler: rxTestScheduler
    }).take(3);
    const expected = '(124|)';

    expectObservable(source).toBe(expected, { '1': 1, '2': 2, '4': 4 });
  });

  it('should emit error if result selector throws', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: x => x * 2,
      timeSelector: x => 0,
      resultSelector: err,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error if result selector throws on scheduler', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: x => x * 2,
      timeSelector: x => 0,
      resultSelector: err,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error after first value if iterate function throws', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: err,
      timeSelector: x => 0,
      scheduler: rxTestScheduler
    });
    const expected = '(1#)';

    expectObservable(source).toBe(expected, { '1': 1 });
  });

  it('should emit error after first value if iterate function throws on scheduler', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: err,
      timeSelector: x => 0,
      scheduler: rxTestScheduler
    });
    const expected = '(1#)';

    expectObservable(source).toBe(expected, { '1': 1 });
  });

  it('should emit error if condition function throws', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      condition: err,
      iterate: x => x + 1,
      timeSelector: x => 0,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error if condition function throws on scheduler', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      condition: err,
      iterate: x => x + 1,
      timeSelector: x => 0,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error if timeSelector function throws on scheduler', () => {
    const source = Observable.generateRelativeTime({
      initialState: 1,
      iterate: x => x + 1,
      timeSelector: err,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  asDiagram('generateRelativeTime(1, x => x < 6, x => x + 1, x => 1000)')
  ('should delay by timeSelector', () => {
    const e1 = Observable.generateRelativeTime({
      initialState: 1,
      condition: x => x < 6,
      iterate: x => x + 1,
      timeSelector: x => time('--|'),
      scheduler: rxTestScheduler
    });
    const expected = '--1-2-3-4-(5|)';
    expectObservable(e1).toBe(expected, {1: 1, 2: 2, 3: 3, 4: 4, 5: 5});
  });
});
