import { expect } from 'chai';
import { NEVER, timer, of, EMPTY, concat, Subject, Observable } from 'rxjs';
import { debounce, mergeMap, mapTo } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare const type: Function;
declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {debounce} */
describe('debounce operator', () => {
  function getTimerSelector(x: number) {
    return () => timer(x, rxTestScheduler);
  }

  asDiagram('debounce')('should debounce values by a specified cold Observable', () => {
    const e1 =   hot('-a--bc--d---|');
    const e2 =  cold('--|          ');
    const expected = '---a---c--d-|';

    const result = e1.pipe(debounce(() => e2));

    expectObservable(result).toBe(expected);
  });

  it('should delay all element by selector observable', () => {
    const e1 =   hot('--a--b--c--d---------|');
    const e1subs =   '^                    !';
    const expected = '----a--b--c--d-------|';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce by selector observable', () => {
    const e1 =   hot('--a--bc--d----|');
    const e1subs =   '^             !';
    const expected = '----a---c--d--|';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support a scalar selector observable', () => {

    // If the selector returns a scalar observable, the debounce operator
    // should emit the value immediately.

    const e1 =   hot('--a--bc--d----|');
    const e1subs =   '^             !';
    const expected = '--a--bc--d----|';

    expectObservable(e1.pipe(debounce(() => of(0)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const e1subs =   '^    !';
    const expected = '-----|';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const e1subs =   '^    !';
    const expected = '-----#';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--bc--d----|');
    const e1subs =   '^      !       ';
    const expected = '----a---       ';
    const unsub =    '       !       ';

    const result = e1.pipe(debounce(getTimerSelector(20)));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--bc--d----|');
    const e1subs =   '^      !       ';
    const expected = '----a---       ';
    const unsub =    '       !       ';

    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      debounce(getTimerSelector(20)),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce and does not complete when source does not completes', () => {
    const e1 =   hot('--a--bc--d---');
    const e1subs =   '^            ';
    const expected = '----a---c--d-';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay all element until source raises error', () => {
    const e1 =   hot('--a--b--c--d---------#');
    const e1subs =   '^                    !';
    const expected = '----a--b--c--d-------#';

    expectObservable(e1.pipe(debounce(getTimerSelector(20)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all elements while source emits by selector observable', () => {
    const e1 =   hot('---a---b---c---d---e|');
    const e1subs =   '^                   !';
    const expected = '--------------------(e|)';

    expectObservable(e1.pipe(debounce(getTimerSelector(40)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all element while source emits by selector observable until raises error', () => {
    const e1 =   hot('--a--b--c--d-#');
    const e1subs =   '^            !';
    const expected = '-------------#';

    expectObservable(e1.pipe(debounce(getTimerSelector(50)))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay element by same selector observable emits multiple', () => {
    const e1 =    hot('----a--b--c----d----e-------|');
    const e1subs =    '^                           !';
    const expected =  '------a--b--c----d----e-----|';
    const selector = cold('--x-y-');
    const selectorSubs =
                   ['    ^ !                      ',
                    '       ^ !                   ',
                    '          ^ !                ',
                    '               ^ !           ',
                    '                    ^ !      '];

    expectObservable(e1.pipe(debounce(() => selector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should debounce by selector observable emits multiple', () => {
    const e1 =     hot('----a--b--c----d----e-------|');
    const e1subs =     '^                           !';
    const expected =   '------a-----c---------e-----|';
    const selector = [cold('--x-y-'),
                    cold(   '----x-y-'),
                    cold(      '--x-y-'),
                    cold(           '------x-y-'),
                    cold(                '--x-y-')];
    const selectorSubs =
                    ['    ^ !                      ',
                     '       ^  !                  ',
                     '          ^ !                ',
                     '               ^    !        ',
                     '                    ^ !      '];

    expectObservable(e1.pipe(debounce(() => selector.shift()))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should debounce by selector observable until source completes', () => {
    const e1 =     hot('----a--b--c----d----e|');
    const e1subs =     '^                    !';
    const expected =   '------a-----c--------(e|)';
    const selector = [cold('--x-y-'),
                    cold(   '----x-y-'),
                    cold(      '--x-y-'),
                    cold(           '------x-y-'),
                    cold(                '--x-y-')];
    const selectorSubs =
                    ['    ^ !               ',
                     '       ^  !           ',
                     '          ^ !         ',
                     '               ^    ! ',
                     '                    ^!'];

    expectObservable(e1.pipe(debounce(() => selector.shift()))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should raise error when selector observable raises error', () => {
    const e1 =   hot('--------a--------b--------c---------|');
    const e1subs =   '^                            !';
    const expected = '---------a---------b---------#';
    const selector = [cold(  '-x-y-'),
                    cold(           '--x-y-'),
                    cold(                    '---#')];
    const selectorSubs =
                  ['        ^!                    ',
                   '                 ^ !          ',
                   '                          ^  !'];

    expectObservable(e1.pipe(debounce(() => selector.shift()))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should raise error when source raises error with selector observable', () => {
    const e1 =   hot('--------a--------b--------c---------d#');
    const e1subs =   '^                                    !';
    const expected = '---------a---------b---------c-------#';
    const selector = [cold(  '-x-y-'),
                    cold(           '--x-y-'),
                    cold(                    '---x-y-'),
                    cold(                              '----x-y-')];
    const selectorSubs =
                  ['        ^!                            ',
                   '                 ^ !                  ',
                   '                          ^  !        ',
                   '                                    ^!'];

    expectObservable(e1.pipe(debounce(() => selector.shift()))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should raise error when selector function throws', () => {
    const e1 =   hot('--------a--------b--------c---------|');
    const e1subs =   '^                         !';
    const expected = '---------a---------b------#';
    const selector = [cold(  '-x-y-'),
                    cold(           '--x-y-')];
    const selectorSubs =
                  ['        ^!                            ',
                   '                 ^ !                  '];

    function selectorFunction(x: string) {
      if (x !== 'c') {
        return selector.shift();
      } else {
        throw 'error';
      }
    }

    expectObservable(e1.pipe(debounce(selectorFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should mirror the source when given an empty selector Observable', () => {
    const e1 =   hot('--------a-x-yz---bxy---z--c--x--y--z|');
    const e1subs =   '^                                   !';
    const expected = '--------a-x-yz---bxy---z--c--x--y--z|';

    function selectorFunction(x: string) { return EMPTY; }

    expectObservable(e1.pipe(debounce(selectorFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should ignore all values except last, when given a never selector Observable', () => {
    const e1 =   hot('--------a-x-yz---bxy---z--c--x--y--z|');
    const e1subs =   '^                                   !';
    const expected = '------------------------------------(z|)';

    function selectorFunction() { return NEVER; }

    expectObservable(e1.pipe(debounce(selectorFunction))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay element by selector observable completes when it does not emits', () => {
    const e1 =   hot('--------a--------b--------c---------|');
    const e1subs =   '^                                   !';
    const expected = '---------a---------b---------c------|';
    const selector = [cold(  '-|'),
                    cold(           '--|'),
                    cold(                    '---|')];
    const selectorSubs =
                  ['        ^!                           ',
                   '                 ^ !                 ',
                   '                          ^  !       '];

    expectObservable(e1.pipe(debounce(() => selector.shift()))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should debounce by selector observable completes when it does not emits', () => {
    const e1 =     hot('----a--b-c---------de-------------|');
    const e1subs =     '^                                 !';
    const expected =   '-----a------c------------e--------|';
    const selector = [cold('-|'),
                    cold(   '--|'),
                    cold(     '---|'),
                    cold(               '----|'),
                    cold(                '-----|')];
    const selectorSubs =
                    ['    ^!                             ',
                     '       ^ !                         ',
                     '         ^  !                      ',
                     '                   ^!              ',
                     '                    ^    !         '];

    expectObservable(e1.pipe(debounce(() => selector.shift()))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let i = 0; i < selectorSubs.length; i++) {
      expectSubscriptions(selector[i].subscriptions).toBe(selectorSubs[i]);
    }
  });

  it('should delay by promise resolves', (done: MochaDone) => {
    const e1 = concat(
      of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(100).pipe(mapTo(4))
    );
    const expected = [1, 2, 3, 4];

    e1.pipe(
      debounce(() => {
        return new Promise((resolve: any) => { resolve(42); });
      })
    ).subscribe((x: number) => {
      expect(x).to.equal(expected.shift()); },
      (x) => {
        done(new Error('should not be called'));
      },
      () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should raises error when promise rejects', (done: MochaDone) => {
    const e1 = concat(
      of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(100).pipe(mapTo(4))
    );
    const expected = [1, 2];
    const error = new Error('error');

    e1.pipe(
      debounce((x: number) => {
        if (x === 3) {
          return new Promise((resolve: any, reject: any) => { reject(error); });
        } else {
          return new Promise((resolve: any) => { resolve(42); });
        }
      })
    ).subscribe((x: number) => {
      expect(x).to.equal(expected.shift()); },
      (err: any) => {
        expect(err).to.be.an('error', 'error');
        expect(expected.length).to.equal(0);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should debounce correctly when synchronously reentered', () => {
    const results: number[] = [];
    const source = new Subject<number>();

    source.pipe(debounce(() => of(null))).subscribe(value => {
      results.push(value);

      if (value === 1) {
        source.next(2);
      }
    });
    source.next(1);

    expect(results).to.deep.equal([1, 2]);
  });

  type('should support selectors of the same type', () => {
    /* tslint:disable:no-unused-variable */
    let o: Observable<number>;
    let s: Observable<number>;
    let r: Observable<number> = o.pipe(debounce((n) => s));
    /* tslint:enable:no-unused-variable */
  });

  type('should support selectors of a different type', () => {
    /* tslint:disable:no-unused-variable */
    let o: Observable<number>;
    let s: Observable<string>;
    let r: Observable<number> = o.pipe(debounce((n) => s));
    /* tslint:enable:no-unused-variable */
  });
});
