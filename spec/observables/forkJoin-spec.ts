import * as Rx from '../../dist/cjs/Rx.KitchenSink';
declare const {hot, expectObservable};
import {DoneSignature, lowerCaseO} from '../helpers/test-helper';

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

  it('should accept promise', (done: DoneSignature) => {
    const e1 = Observable.forkJoin(
               Observable.of(1),
               Promise.resolve(2)
            );

    e1.subscribe((x: Array<number>) => {
      expect(x).toEqual([1, 2]);
    },
    (err: any) => {
      done.fail('should not be called');
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

});
