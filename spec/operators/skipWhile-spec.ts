import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { skipWhile, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {skipWhile} */
describe('skipWhile operator', () => {
  asDiagram('skipWhile(x => x < 4)')('should skip all elements until predicate is false', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '-------4--5--6--|';

    const predicate = function (v: string) {
      return +v < 4;
    };

    expectObservable(source.pipe(skipWhile(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip all elements with a true predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '----------------|';

    expectObservable(source.pipe(skipWhile(() => true))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip all elements with a truthy predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '----------------|';

    expectObservable(source.pipe(skipWhile((): any => { return {}; }))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not skip any element with a false predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '-2--3--4--5--6--|';

    expectObservable(source.pipe(skipWhile(() => false))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not skip any elements with a falsy predicate', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^               !';
    const expected =      '-2--3--4--5--6--|';

    expectObservable(source.pipe(skipWhile(() => undefined))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip elements on hot source', () => {
    const source = hot('--1--2-^-3--4--5--6--7--8--');
    const sourceSubs =        '^                   ';
    const expected =          '--------5--6--7--8--';

    const predicate = function (v: string) {
      return +v < 5;
    };

    expectObservable(source.pipe(skipWhile(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be possible to skip using the element\'s index', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^                   !';
    const expected =          '--------e--f--g--h--|';

    const predicate = function (v: string, index: number) {
      return index < 2;
    };

    expectObservable(source.pipe(skipWhile(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip using index with source unsubscribes early', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^          !';
    const unsub =             '-----------!';
    const expected =          '-----d--e---';

    const predicate = function (v: string, index: number) {
      return index < 1;
    };

    expectObservable(source.pipe(skipWhile(predicate)), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^          !';
    const expected =          '-----d--e---';
    const unsub =             '           !';

    const predicate = function (v: string, index: number) {
      return index < 1;
    };

    const result = source.pipe(
      mergeMap(function (x) { return of(x); }),
      skipWhile(predicate),
      mergeMap(function (x) { return of(x); })
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip using value with source throws', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--#');
    const sourceSubs =        '^                   !';
    const expected =          '-----d--e--f--g--h--#';

    const predicate = function (v: string) {
      return v !== 'd';
    };

    expectObservable(source.pipe(skipWhile(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should invoke predicate while its false and never again', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^                   !';
    const expected =          '--------e--f--g--h--|';

    let invoked = 0;
    const predicate = function (v: string) {
      invoked++;
      return v !== 'e';
    };

    expectObservable(
      source.pipe(
        skipWhile(predicate),
        tap(null, null, () => {
          expect(invoked).to.equal(3);
        })
      )
    ).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should handle predicate that throws', () => {
    const source = hot('--a--b-^-c--d--e--f--g--h--|');
    const sourceSubs =        '^       !';
    const expected =          '--------#';

    const predicate = function (v: string) {
      if (v === 'e') {
        throw new Error('nom d\'une pipe !');
      }

      return v !== 'f';
    };

    expectObservable(source.pipe(skipWhile(predicate))).toBe(expected, undefined, new Error('nom d\'une pipe !'));
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should handle Observable.empty', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '|';

    expectObservable(source.pipe(skipWhile(() => true))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle Observable.never', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable(source.pipe(skipWhile(() => true))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle Observable.throw', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.pipe(skipWhile(() => true))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
