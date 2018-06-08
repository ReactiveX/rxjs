import { expect } from 'chai';
import { cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { repeat, mergeMap, map, multicast, refCount } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Subject } from 'rxjs';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {repeat} */
describe('repeat operator', () => {
  asDiagram('repeat(3)')('should resubscribe count number of times', () => {
    const e1 =   cold('--a--b--|                ');
    const subs =     ['^       !                ',
                    '        ^       !        ',
                    '                ^       !'];
    const expected =  '--a--b----a--b----a--b--|';

    expectObservable(e1.pipe(repeat(3))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should resubscribe multiple times', () => {
    const e1 =   cold('--a--b--|                        ');
    const subs =     ['^       !                        ',
                    '        ^       !                ',
                    '                ^       !        ',
                    '                        ^       !'];
    const expected =  '--a--b----a--b----a--b----a--b--|';

    expectObservable(e1.pipe(repeat(2), repeat(2))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete without emit when count is zero', () => {
    const e1 =  cold('--a--b--|');
    const subs: string[] = [];
    const expected = '|';

    expectObservable(e1.pipe(repeat(0))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit source once when count is one', () => {
    const e1 =  cold('--a--b--|');
    const subs =     '^       !';
    const expected = '--a--b--|';

    expectObservable(e1.pipe(repeat(1))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should repeat until gets unsubscribed', () => {
    const e1 =  cold('--a--b--|      ');
    const subs =    ['^       !      ',
                   '        ^     !'];
    const unsub =    '              !';
    const expected = '--a--b----a--b-';

    expectObservable(e1.pipe(repeat(10)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should be able to repeat indefinitely until unsubscribed', () => {
    const e1 =  cold('--a--b--|                                    ');
    const subs =    ['^       !                                    ',
                   '        ^       !                            ',
                   '                ^       !                    ',
                   '                        ^       !            ',
                   '                                ^       !    ',
                   '                                        ^   !'];
    const unsub =    '                                            !';
    const expected = '--a--b----a--b----a--b----a--b----a--b----a--';

    expectObservable(e1.pipe(repeat()), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 =  cold('--a--b--|                                    ');
    const subs =    ['^       !                                    ',
                   '        ^       !                            ',
                   '                ^       !                    ',
                   '                        ^       !            ',
                   '                                ^       !    ',
                   '                                        ^   !'];
    const unsub =    '                                            !';
    const expected = '--a--b----a--b----a--b----a--b----a--b----a--';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      repeat(),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should consider negative count as repeat indefinitely', () => {
    const e1 =  cold('--a--b--|                                    ');
    const subs =    ['^       !                                    ',
                   '        ^       !                            ',
                   '                ^       !                    ',
                   '                        ^       !            ',
                   '                                ^       !    ',
                   '                                        ^   !'];
    const unsub =    '                                            !';
    const expected = '--a--b----a--b----a--b----a--b----a--b----a--';

    expectObservable(e1.pipe(repeat(-1)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(repeat(3))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source does not completes', () => {
    const e1 =  cold('-');
    const unsub =    '                              !';
    const subs =     '^                             !';
    const expected = '-';

    expectObservable(e1.pipe(repeat(3)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not complete without emit but count is zero', () => {
    const e1 =  cold('-');
    const subs: string[] = [];
    const expected = '|';

    expectObservable(e1.pipe(repeat(0))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not complete but count is zero', () => {
    const e1 =   cold('--a--b--');
    const subs: string[] = [];
    const expected = '|';

    expectObservable(e1.pipe(repeat(0))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit source once and does not complete when source emits but does not complete', () => {
    const e1 =   cold('--a--b--');
    const subs =     ['^       '];
    const expected =  '--a--b--';

    expectObservable(e1.pipe(repeat(3))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =  ['(^!)', '(^!)', '(^!)'];
    const expected = '|';

    expectObservable(e1.pipe(repeat(3))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =  cold('----|        ');
    const subs =    ['^   !        ',
                   '    ^   !    ',
                   '        ^   !'];
    const expected = '------------|';

    expectObservable(e1.pipe(repeat(3))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not emit but count is zero', () => {
    const e1 =  cold('----|');
    const subs: string[] = [];
    const expected = '|';

    expectObservable(e1.pipe(repeat(0))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', () => {
    const e1 =  cold('--a--b--#');
    const subs =     '^       !';
    const expected = '--a--b--#';

    expectObservable(e1.pipe(repeat(2))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raises error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(repeat(3))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error if source throws when repeating infinitely', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(repeat())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error after first emit succeed', () => {
    let repeated = false;

    const e1 = cold('--a--|').pipe(map((x: string) => {
      if (repeated) {
        throw 'error';
      } else {
        repeated = true;
        return x;
      }
    }));
    const expected = '--a----#';

    expectObservable(e1.pipe(repeat(2))).toBe(expected);
  });

  it('should repeat a synchronous source (multicasted and refCounted) multiple times', (done: MochaDone) => {
    const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    of(1, 2, 3).pipe(
      multicast(() => new Subject<number>()),
      refCount(),
      repeat(5)
    ).subscribe(
        (x: number) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          expect(expected.length).to.equal(0);
          done();
        });
  });
});
