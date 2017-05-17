import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {takeLast} */
describe('Observable.prototype.skipLast', () => {
  asDiagram('skipLast(2)')('should skip two values of an observable with many values', () => {
    const e1 =  cold('--a-----b----c---d--|');
    const e1subs =   '^                   !';
    const expected = '-------------a---b--|';

    expectObservable(e1.skipLast(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip last three values', () => {
    const e1 =  cold('--a-----b----c---d--|');
    const e1subs =   '^                   !';
    const expected = '-----------------a--|';

    expectObservable(e1.skipLast(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all values when trying to take larger then source', () => {
    const e1 =  cold('--a-----b----c---d--|');
    const e1subs =   '^                   !';
    const expected = '--------------------|';

    expectObservable(e1.skipLast(5)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all element when try to take exact', () => {
    const e1 =  cold('--a-----b----c---d--|');
    const e1subs =   '^                   !';
    const expected = '--------------------|';

    expectObservable(e1.skipLast(4)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not skip any values', () => {
    const e1 =  cold('--a-----b----c---d--|');
    const e1subs =   '^                   !';
    const expected = '--a-----b----c---d--|';

    expectObservable(e1.skipLast(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.skipLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should go on forever on never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.skipLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip one value from an observable with one value', () => {
    const e1 =   hot('---(a|)');
    const e1subs =   '^  !   ';
    const expected = '---|   ';

    expectObservable(e1.skipLast(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip one value from an observable with many values', () => {
    const e1 = hot('--a--^--b----c---d--|');
    const e1subs =      '^              !';
    const expected =    '--------b---c--|';

    expectObservable(e1.skipLast(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with empty and early emission', () => {
    const e1 = hot('--a--^----|');
    const e1subs =      '^    !';
    const expected =    '-----|';

    expectObservable(e1.skipLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate error from the source observable', () => {
    const e1 = hot('---^---#', null, 'too bad');
    const e1subs =    '^   !';
    const expected =  '----#';

    expectObservable(e1.skipLast(42)).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate error from an observable with values', () => {
    const e1 = hot('---^--a--b--#');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable(e1.skipLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 = hot('---^--a--b-----c--d--e--|');
    const unsub =     '         !            ';
    const e1subs =    '^        !            ';
    const expected =  '----------            ';

    expectObservable(e1.skipLast(42), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.skipLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should throw if total is less than zero', () => {
    expect(() => { Observable.range(0, 10).skipLast(-1); })
      .to.throw(Rx.ArgumentOutOfRangeError);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 = hot('---^--a--b-----c--d--e--|');
    const unsub =     '         !            ';
    const e1subs =    '^        !            ';
    const expected =  '----------            ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .skipLast(42)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});