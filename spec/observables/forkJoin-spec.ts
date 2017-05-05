import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import {lowerCaseO} from '../helpers/test-helper';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const {type};
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {forkJoin} */
describe('Observable.forkJoin', () => {
  it('should join the last values of the provided observables into an array', () => {
    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('--1--2--3--|')
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should allow emit null or undefined', () => {
    const e2 = Observable.forkJoin(
               hot('--a--b--c--d--|', { d: null }),
               hot('(b|)'),
               hot('--1--2--3--|'),
               hot('-----r--t--u--|', { u: undefined })
            );
    const expected2 = '--------------(x|)';

    expectObservable(e2).toBe(expected2, {x: [null, 'b', '3', undefined]});
  });

  it('should join the last values of the provided observables with selector', () => {
    function selector(x, y, z) {
      return x + y + z;
    }

    const e1 = Observable.forkJoin(
                hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|'),
                selector
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'db3'});
  });

  it('should accept single observable', () => {
    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|')
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d']});
  });

  it('should accept array of observable contains single', () => {
    const e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|')]
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d']});
  });

  it('should accept single observable with selector', () => {
    function selector(x) {
      return x + x;
    }

    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               selector
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'dd'});
  });

  it('should accept array of observable contains single with selector', () => {
    function selector(x) {
      return x + x;
    }

    const e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|')],
               selector
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'dd'});
  });

  it('should accept lowercase-o observables', () => {
    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               lowerCaseO('1', '2', '3')
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should accept empty lowercase-o observables', () => {
    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               lowerCaseO()
            );
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should accept promise', (done: MochaDone) => {
    const e1 = Observable.forkJoin(
               Observable.of(1),
               Promise.resolve(2)
            );

    e1.subscribe((x: Array<number>) => {
      expect(x).to.deep.equal([1, 2]);
    },
    (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should accept array of observables', () => {
    const e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|')]
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should accept array of observables with selector', () => {
    function selector(x, y, z) {
      return x + y + z;
    }

    const e1 = Observable.forkJoin(
               [hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|')],
                selector
             );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'db3'});
  });

  it('should not emit if any of source observable is empty', () => {
    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('------------------|')
            );
    const expected = '------------------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete early if any of source is empty and completes before than others', () => {
    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('---------|')
    );
    const expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when all sources are empty', () => {
    const e1 = Observable.forkJoin(
               hot('--------------|'),
               hot('---------|')
    );
    const expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should not complete when only source never completes', () => {
    const e1 = Observable.forkJoin(
      hot('--------------')
    );
    const expected = '-';

    expectObservable(e1).toBe(expected);
  });

  it('should not complete when one of the sources never completes', () => {
    const e1 = Observable.forkJoin(
      hot('--------------'),
      hot('-a---b--c--|')
    );
    const expected = '-';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when one of the sources never completes but other completes without values', () => {
    const e1 = Observable.forkJoin(
                 hot('--------------'),
                 hot('------|')
    );
    const expected = '------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete if source is not provided', () => {
    const e1 = Observable.forkJoin();
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete if sources list is empty', () => {
    const e1 = Observable.forkJoin([]);
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when any of source is empty with selector', () => {
    function selector(x, y) {
      return x + y;
    }

    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('---------|'),
               selector);
    const expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should emit results by resultselector', () => {
    function selector(x, y) {
      return x + y;
    }

    const e1 = Observable.forkJoin(
               hot('--a--b--c--d--|'),
               hot('---2-----|'),
               selector);
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: 'd2'});
  });

  it('should raise error when any of source raises error with empty observable', () => {
    const e1 = Observable.forkJoin(
               hot('------#'),
               hot('---------|'));
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when any of source raises error with source that never completes', () => {
    const e1 = Observable.forkJoin(
                 hot('------#'),
                 hot('----------'));
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when any of source raises error with selector with empty observable', () => {
    function selector(x, y) {
      return x + y;
    }

    const e1 = Observable.forkJoin(
               hot('------#'),
               hot('---------|'),
               selector);
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when source raises error', () => {
    const e1 = Observable.forkJoin(
               hot('------#'),
               hot('---a-----|'));
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when source raises error with selector', () => {
    function selector(x, y) {
      return x + y;
    }

    const e1 = Observable.forkJoin(
               hot('------#'),
               hot('-------b-|'),
               selector);
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--^--b--c---d-| ');
    const e1subs =        '^        !    ';
    const e2 =   hot('---e-^---f--g---h-|');
    const e2subs =        '^        !    ';
    const expected =      '----------    ';
    const unsub =         '         !    ';

    const result = Observable.forkJoin(e1, e2);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe other Observables, when one of them errors', () => {
    const e1 =   hot('--a--^--b--c---d-| ');
    const e1subs =        '^        !    ';
    const e2 =   hot('---e-^---f--g-#');
    const e2subs =        '^        !    ';
    const expected =      '---------#    ';

    const result = Observable.forkJoin(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should support promises', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>;
      let b: Promise<string>;
      let c: Promise<boolean>;
      let o1: Rx.Observable<[number, string, boolean]> = Observable.forkJoin(a, b, c);
      let o2: Rx.Observable<boolean> = Observable.forkJoin(a, b, c, (aa, bb, cc) => !!aa && !!bb && cc);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support observables', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Rx.Observable<number>;
      let b: Rx.Observable<string>;
      let c: Rx.Observable<boolean>;
      let o1: Rx.Observable<[number, string, boolean]> = Observable.forkJoin(a, b, c);
      let o2: Rx.Observable<boolean> = Observable.forkJoin(a, b, c, (aa, bb, cc) => !!aa && !!bb && cc);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support mixed observables and promises', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>;
      let b: Rx.Observable<string>;
      let c: Promise<boolean>;
      let d: Rx.Observable<string[]>;
      let o1: Rx.Observable<[number, string, boolean, string[]]> = Observable.forkJoin(a, b, c, d);
      let o2: Rx.Observable<boolean> = Observable.forkJoin(a, b, c, d, (aa, bb, cc, dd) => !!aa && !!bb && cc && !!dd.length);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support arrays of promises', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>[];
      let o1: Rx.Observable<number[]> = Observable.forkJoin(a);
      let o2: Rx.Observable<number[]> = Observable.forkJoin(...a);
      let o3: Rx.Observable<number> = Observable.forkJoin(a, (...x) => x.length);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support arrays of observables', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Rx.Observable<number>[];
      let o1: Rx.Observable<number[]> = Observable.forkJoin(a);
      let o2: Rx.Observable<number[]> = Observable.forkJoin(...a);
      let o3: Rx.Observable<number> = Observable.forkJoin(a, (...x) => x.length);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should return Array<T> when given a single promise', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>;
      let o1: Rx.Observable<number[]> = Observable.forkJoin(a);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should return Array<T> when given a single observable', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Rx.Observable<number>;
      let o1: Rx.Observable<number[]> = Observable.forkJoin(a);
      /* tslint:enable:no-unused-variable */
    });
  });
});
