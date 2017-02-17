import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {skipWhile} */
describe('Observable.prototype.skipWhile', () => {
  asDiagram('skipWhile(x => x < 4)')('should skip all elements until predicate is false', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '-------4--5--6--|';

    const predicate = function (v) {
      return +v < 4;
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip all elements with a true predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '----------------|';

    expectObservable(source.skipWhile(() => true)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip all elements with a truthy predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '----------------|';

    expectObservable(source.skipWhile((): any => { return {}; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not skip any element with a false predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '-2--3--4--5--6--|';

    expectObservable(source.skipWhile(() => false)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not skip any elements with a falsy predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '-2--3--4--5--6--|';

    expectObservable(source.skipWhile(() => undefined)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip elements on hot source', () => {
    const source = hot('--1--2-^-3--4--5--6--7--8--');
    const sourceSubs =        '^                   ';
    const expected =          '--------5--6--7--8--';

    const predicate = function (v) {
      return +v < 5;
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be possible to skip using the element\'s index', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^                   !';
    const expected =          '--------e--f--g--h--|';

    const predicate = function (v, index) {
      return index < 2;
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip using index with source unsubscribes early', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^          !';
    const unsub =             '-----------!';
    const expected =          '-----d--e---';

    const predicate = function (v, index) {
      return index < 1;
    };

    expectObservable(source.skipWhile(predicate), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^          !';
    const expected =          '-----d--e---';
    const unsub =             '           !';

    const predicate = function (v, index) {
      return index < 1;
    };

    const result = source
      .mergeMap(function (x) { return Observable.of(x); })
      .skipWhile(predicate)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip using value with source throws', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--#');
    const sourceSubs =        '^                   !';
    const expected =          '-----d--e--f--g--h--#';

    const predicate = function (v) {
      return v !== 'd';
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should invoke predicate while its false and never again', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^                   !';
    const expected =          '--------e--f--g--h--|';

    let invoked = 0;
    const predicate = function (v) {
      invoked++;
      return v !== 'e';
    };

    expectObservable(
      source.skipWhile(predicate).do(null, null, () => {
        expect(invoked).to.equal(3);
      })
    ).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should handle predicate that throws', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^       !';
    const expected =          '--------#';

    const predicate = function (v) {
      if (v === 'e') {
        throw new Error('nom d\'une pipe !');
      }

      return v !== 'f';
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected, undefined, new Error('nom d\'une pipe !'));
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should handle Observable.empty', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '|';

    expectObservable(source.skipWhile(() => true)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle Observable.never', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable(source.skipWhile(() => true)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle Observable.throw', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.skipWhile(() => true)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
