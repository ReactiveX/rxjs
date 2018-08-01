import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { Observable, of, from } from 'rxjs';
import { switchMapTo, mergeMap } from 'rxjs/operators';

declare function asDiagram(arg: string): Function;

/** @test {switchMapTo} */
describe('switchMapTo', () => {
  asDiagram('switchMapTo( 10\u2014\u201410\u2014\u201410\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-x-xx-x-x---|';
    const values = {x: 10};

    const result = e1.pipe(switchMapTo(e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3).pipe(
      switchMapTo(
        of(4, 5, 6),
        (a, b, i, ii) => [a, b, i, ii]
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          [1, 4, 0, 0],
          [1, 5, 0, 1],
          [1, 6, 0, 2],
          [2, 4, 1, 0],
          [2, 5, 1, 1],
          [2, 6, 1, 2],
          [3, 4, 2, 0],
          [3, 5, 2, 1],
          [3, 6, 2, 2],
        ]);
      }
    });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3).pipe(
      switchMapTo(
        of(4, 5, 6),
        void 0
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          4, 5, 6, 4, 5, 6, 4, 5, 6
        ]);
      }
    });
  });

  it('should switch a synchronous many outer to a synchronous many inner', (done) => {
    const a = of(1, 2, 3);
    const expected = ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'];
    a.pipe(switchMapTo(of('a', 'b', 'c'))).subscribe((x) => {
      expect(x).to.equal(expected.shift());
    }, null, done);
  });

  it('should unsub inner observables', () => {
    let unsubbed = 0;

    of('a', 'b').pipe(switchMapTo(
      new Observable<string>((subscriber) => {
        subscriber.complete();
        return () => {
          unsubbed++;
        };
      })
    )).subscribe();

    expect(unsubbed).to.equal(2);
  });

  it('should switch to an inner cold observable', () => {
    const x =   cold(         '--a--b--c--d--e--|          ');
    const xsubs =   ['         ^         !                 ',
    //                                 --a--b--c--d--e--|
                     '                   ^                !'];
    const e1 =   hot('---------x---------x---------|       ');
    const e1subs =   '^                            !       ';
    const expected = '-----------a--b--c---a--b--c--d--e--|';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, outer eventually throws', () => {
    const x =   cold(         '--a--b--c--d--e--|');
    const xsubs =    '         ^         !       ';
    const e1 =   hot('---------x---------#       ');
    const e1subs =   '^                  !       ';
    const expected = '-----------a--b--c-#       ';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, outer is unsubscribed early', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =   ['         ^         !          ',
    //                                 --a--b--c--d--e--|
                     '                   ^  !       '];
    const e1 =   hot('---------x---------x---------|');
    const unsub =    '                      !       ';
    const e1subs =   '^                     !       ';
    const expected = '-----------a--b--c---a-       ';

    expectObservable(e1.pipe(switchMapTo(x)), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =   ['         ^         !          ',
    //                                 --a--b--c--d--e--|
                     '                   ^  !       '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                     !       ';
    const expected = '-----------a--b--c---a-       ';
    const unsub =    '                      !       ';

    const result = e1.pipe(
      mergeMap(x => of(x)),
      switchMapTo(x),
      mergeMap(x => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, inner never completes', () => {
    const x =   cold(         '--a--b--c--d--e-          ');
    const xsubs =   ['         ^         !               ',
    //                                 --a--b--c--d--e-
                     '                   ^               '];
    const e1 =   hot('---------x---------y---------|     ');
    const e1subs =   '^                            !     ';
    const expected = '-----------a--b--c---a--b--c--d--e-';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch to the inner observable', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =   ['         (^!)                 ',
                     '         ^                !   '];
    const e1 =   hot('---------(xx)----------------|');
    const e1subs =   '^                            !';
    const expected = '-----------a--b--c--d--e-----|';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, inner raises an error', () => {
    const x =   cold(         '--a--b--#            ');
    const xsubs =    '         ^       !            ';
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                !            ';
    const expected = '-----------a--b--#            ';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch an inner hot observable', () => {
    const x =    hot('--p-o-o-p---a--b--c--d-|      ');
    const xsubs =   ['         ^         !          ',
                     '                   ^   !      '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                            !';
    const expected = '------------a--b--c--d-------|';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner empty', () => {
    const x = cold('|');
    const xsubs =   ['         (^!)                 ',
                     '                   (^!)       '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                            !';
    const expected = '-----------------------------|';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner never', () => {
    const x = cold('-');
    const xsubs =   ['         ^         !          ',
                     '                   ^          '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                            !';
    const expected = '------------------------------';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner that just raises an error', () => {
    const x = cold('#');
    const xsubs =    '         (^!)                 ';
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^        !                    ';
    const expected = '---------#                    ';

    expectObservable(e1.pipe(switchMapTo(x))).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an empty outer', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(switchMapTo(of('foo')))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never outer', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(switchMapTo(of('foo')))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an outer that just raises and error', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(switchMapTo(of('foo')))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
