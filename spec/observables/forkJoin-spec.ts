import { expect } from 'chai';
import { Observable, forkJoin, of } from 'rxjs';
import { lowerCaseO } from '../helpers/test-helper';
import { hot, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare const type: Function;
declare const asDiagram: Function;

/** @test {forkJoin} */
describe('forkJoin', () => {
  asDiagram('forkJoin')
    ('should join the last values of the provided observables into an array', () => {
      const e1 = forkJoin(
                   hot('---a---b---c---d---|'),
                   hot('-1---2---3---|')
      );
      const expected = '-------------------(x|)';

      expectObservable(e1).toBe(expected, {x: ['d', '3']});
    });

  it('should support the deprecated resultSelector with an Array of ObservableInputs', () => {
    const results: Array<number|string> = [];
    forkJoin(
      [
        of(1, 2, 3),
        of(4, 5, 6),
        of(7, 8, 9),
      ],
      (a: number, b: number, c: number) => a + b + c,
    )
    .subscribe({
      next(value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        results.push('done');
      }
    });

    expect(results).to.deep.equal([18, 'done']);
  });

  it('should support the deprecated resultSelector with a spread of ObservableInputs', () => {
    const results: Array<number|string> = [];
    forkJoin(
      of(1, 2, 3),
      of(4, 5, 6),
      of(7, 8, 9),
      (a: number, b: number, c: number) => a + b + c,
    )
    .subscribe({
      next(value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        results.push('done');
      }
    });

    expect(results).to.deep.equal([18, 'done']);
  });

  it('should join the last values of the provided observables into an array', () => {
    const e1 = forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('--1--2--3--|')
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should allow emit null or undefined', () => {
    const e2 = forkJoin(
               hot('--a--b--c--d--|', { d: null }),
               hot('(b|)'),
               hot('--1--2--3--|'),
               hot('-----r--t--u--|', { u: undefined })
            );
    const expected2 = '--------------(x|)';

    expectObservable(e2).toBe(expected2, {x: [null, 'b', '3', undefined]});
  });

  it('should accept single observable', () => {
    const e1 = forkJoin(
               hot('--a--b--c--d--|')
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d']});
  });

  it('should accept array of observable contains single', () => {
    const e1 = forkJoin(
               [hot('--a--b--c--d--|')]
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d']});
  });

  it('should accept lowercase-o observables', () => {
    const e1 = forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               lowerCaseO('1', '2', '3')
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should accept empty lowercase-o observables', () => {
    const e1 = forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               lowerCaseO()
            );
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should accept promise', (done: MochaDone) => {
    const e1 = forkJoin(
               of(1),
               Promise.resolve(2)
            );

    e1.subscribe((x: number[]) => {
      expect(x).to.deep.equal([1, 2]);
    },
    (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should accept array of observables', () => {
    const e1 = forkJoin(
               [hot('--a--b--c--d--|'),
                hot('(b|)'),
                hot('--1--2--3--|')]
            );
    const expected = '--------------(x|)';

    expectObservable(e1).toBe(expected, {x: ['d', 'b', '3']});
  });

  it('should not emit if any of source observable is empty', () => {
    const e1 = forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('------------------|')
            );
    const expected = '------------------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete early if any of source is empty and completes before than others', () => {
    const e1 = forkJoin(
               hot('--a--b--c--d--|'),
               hot('(b|)'),
               hot('---------|')
    );
    const expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when all sources are empty', () => {
    const e1 = forkJoin(
               hot('--------------|'),
               hot('---------|')
    );
    const expected = '---------|';

    expectObservable(e1).toBe(expected);
  });

  it('should not complete when only source never completes', () => {
    const e1 = forkJoin(
      hot('--------------')
    );
    const expected = '-';

    expectObservable(e1).toBe(expected);
  });

  it('should not complete when one of the sources never completes', () => {
    const e1 = forkJoin(
      hot('--------------'),
      hot('-a---b--c--|')
    );
    const expected = '-';

    expectObservable(e1).toBe(expected);
  });

  it('should complete when one of the sources never completes but other completes without values', () => {
    const e1 = forkJoin(
                 hot('--------------'),
                 hot('------|')
    );
    const expected = '------|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete if source is not provided', () => {
    const e1 = forkJoin();
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should complete if sources list is empty', () => {
    const e1 = forkJoin([]);
    const expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when any of source raises error with empty observable', () => {
    const e1 = forkJoin(
               hot('------#'),
               hot('---------|'));
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when any of source raises error with source that never completes', () => {
    const e1 = forkJoin(
                 hot('------#'),
                 hot('----------'));
    const expected = '------#';

    expectObservable(e1).toBe(expected);
  });

  it('should raise error when source raises error', () => {
    const e1 = forkJoin(
               hot('------#'),
               hot('---a-----|'));
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

    const result = forkJoin(e1, e2);

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

    const result = forkJoin(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  type('should support promises', () => {
    /* tslint:disable:no-unused-variable */
    let a: Promise<number>;
    let b: Promise<string>;
    let c: Promise<boolean>;
    let o1: Observable<[number, string, boolean]> = forkJoin(a, b, c);
    let o2: Observable<boolean> = forkJoin(a, b, c, (aa: number, bb: string, cc: boolean) => !!aa && !!bb && cc);
    /* tslint:enable:no-unused-variable */
  });

  type('should support observables', () => {
    /* tslint:disable:no-unused-variable */
    let a: Observable<number>;
    let b: Observable<string>;
    let c: Observable<boolean>;
    let o1: Observable<[number, string, boolean]> = forkJoin(a, b, c);
    let o2: Observable<boolean> = forkJoin(a, b, c, (aa: number, bb: string, cc: boolean) => !!aa && !!bb && cc);
    /* tslint:enable:no-unused-variable */
  });

  type('should support mixed observables and promises', () => {
    /* tslint:disable:no-unused-variable */
    let a: Promise<number>;
    let b: Observable<string>;
    let c: Promise<boolean>;
    let d: Observable<string[]>;
    let o1: Observable<[number, string, boolean, string[]]> = forkJoin(a, b, c, d);
    /* tslint:enable:no-unused-variable */
  });

  type('should support arrays of promises', () => {
    /* tslint:disable:no-unused-variable */
    let a: Promise<number>[];
    let o1: Observable<number[]> = forkJoin(a);
    let o2: Observable<number[]> = forkJoin(...a);
    /* tslint:enable:no-unused-variable */
  });

  type('should support arrays of observables', () => {
    /* tslint:disable:no-unused-variable */
    let a: Observable<number>[];
    let o1: Observable<number[]> = forkJoin(a);
    let o2: Observable<number[]> = forkJoin(...a);
    /* tslint:enable:no-unused-variable */
  });

  type('should return Array<T> when given a single promise', () => {
    /* tslint:disable:no-unused-variable */
    let a: Promise<number>;
    let o1: Observable<number[]> = forkJoin(a);
    /* tslint:enable:no-unused-variable */
  });

  type('should return Array<T> when given a single observable', () => {
    /* tslint:disable:no-unused-variable */
    let a: Observable<number>;
    let o1: Observable<number[]> = forkJoin(a);
    /* tslint:enable:no-unused-variable */
  });
});
