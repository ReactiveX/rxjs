import * as Rx from '../../dist/cjs/Rx';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, asDiagram} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.prototype.takeLast()', () => {
  asDiagram('takeLast(2)')('should take two values of an observable with many values', () => {
    const e1 =  cold('--a-----b----c---d--|    ');
    const e1subs =   '^                   !    ';
    const expected = '--------------------(cd|)';

    expectObservable(e1.takeLast(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should go on forever on never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be empty on takeLast(0)', () => {
    const e1 = hot('--a--^--b----c---d--|');
    const e1subs = []; // Don't subscribe at all
    const expected =    '|';

    expectObservable(e1.takeLast(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take one value from an observable with one value', () => {
    const e1 =   hot('---(a|)');
    const e1subs =   '^  !   ';
    const expected = '---(a|)';

    expectObservable(e1.takeLast(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take one value from an observable with many values', () => {
    const e1 = hot('--a--^--b----c---d--|   ');
    const e1subs =      '^              !   ';
    const expected =    '---------------(d|)';

    expectObservable(e1.takeLast(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on empty', () => {
    const e1 = hot('--a--^----|');
    const e1subs =      '^    !';
    const expected =    '-----|';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate error from the source observable', () => {
    const e1 = hot('---^---#', null, 'too bad');
    const e1subs =    '^   !';
    const expected =  '----#';

    expectObservable(e1.takeLast(42)).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate error from an observable with values', () => {
    const e1 = hot('---^--a--b--#');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 = hot('---^--a--b-----c--d--e--|');
    const unsub =     '         !            ';
    const e1subs =    '^        !            ';
    const expected =  '----------            ';

    expectObservable(e1.takeLast(42), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should throw if total is less than zero', () => {
    expect(() => { Observable.range(0, 10).takeLast(-1); })
      .toThrow(new Rx.ArgumentOutOfRangeError());
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 = hot('---^--a--b-----c--d--e--|');
    const unsub =     '         !            ';
    const e1subs =    '^        !            ';
    const expected =  '----------            ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .takeLast(42)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
