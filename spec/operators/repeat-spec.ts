import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {repeat} */
describe('Observable.prototype.repeat', () => {
  asDiagram('repeat(3)')('should resubscribe count number of times', () => {
    const e1 =   cold('--a--b--|                ');
    const subs =     ['^       !                ',
                    '        ^       !        ',
                    '                ^       !'];
    const expected =  '--a--b----a--b----a--b--|';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should resubscribe multiple times', () => {
    const e1 =   cold('--a--b--|                        ');
    const subs =     ['^       !                        ',
                    '        ^       !                ',
                    '                ^       !        ',
                    '                        ^       !'];
    const expected =  '--a--b----a--b----a--b----a--b--|';

    expectObservable(e1.repeat(2).repeat(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete without emit when count is zero', () => {
    const e1 =  cold('--a--b--|');
    const subs = [];
    const expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit source once when count is one', () => {
    const e1 =  cold('--a--b--|');
    const subs =     '^       !';
    const expected = '--a--b--|';

    expectObservable(e1.repeat(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should repeat until gets unsubscribed', () => {
    const e1 =  cold('--a--b--|      ');
    const subs =    ['^       !      ',
                   '        ^     !'];
    const unsub =    '              !';
    const expected = '--a--b----a--b-';

    expectObservable(e1.repeat(10), unsub).toBe(expected);
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

    expectObservable(e1.repeat(), unsub).toBe(expected);
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

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .repeat()
      .mergeMap((x: string) => Observable.of(x));

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

    expectObservable(e1.repeat(-1), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source does not completes', () => {
    const e1 =  cold('-');
    const unsub =    '                              !';
    const subs =     '^                             !';
    const expected = '-';

    expectObservable(e1.repeat(3), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not complete without emit but count is zero', () => {
    const e1 =  cold('-');
    const subs = [];
    const expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not complete but count is zero', () => {
    const e1 =   cold('--a--b--');
    const subs = [];
    const expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit source once and does not complete when source emits but does not complete', () => {
    const e1 =   cold('--a--b--');
    const subs =     ['^       '];
    const expected =  '--a--b--';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =  ['(^!)', '(^!)', '(^!)'];
    const expected = '|';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =  cold('----|        ');
    const subs =    ['^   !        ',
                   '    ^   !    ',
                   '        ^   !'];
    const expected = '------------|';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete immediately when source does not emit but count is zero', () => {
    const e1 =  cold('----|');
    const subs = [];
    const expected = '|';

    expectObservable(e1.repeat(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', () => {
    const e1 =  cold('--a--b--#');
    const subs =     '^       !';
    const expected = '--a--b--#';

    expectObservable(e1.repeat(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raises error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.repeat(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error if source throws when repeating infinitely', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.repeat()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should terminate repeat and throw if source subscription to _next throws', () => {
    const e1 = Observable.of<number>(1, 2, rxTestScheduler);
    e1.subscribe(() => { throw new Error('error'); });

    expect(() => {
      e1.repeat(3);
      rxTestScheduler.flush();
    }).to.throw();
  });

  it('should terminate repeat and throw if source subscription to _complete throws', () => {
    const e1 = Observable.of<number>(1, 2, rxTestScheduler);
    e1.subscribe(() => {
      //noop
    }, () => {
      //noop
    }, () => { throw new Error('error'); });

    expect(() => {
      e1.repeat(3);
      rxTestScheduler.flush();
    }).to.throw();
  });

  it('should terminate repeat and throw if source subscription to _next throws when repeating infinitely', () => {
    const e1 = Observable.of<number>(1, 2, rxTestScheduler);
    e1.subscribe(() => { throw new Error('error'); });

    expect(() => {
      e1.repeat();
      rxTestScheduler.flush();
    }).to.throw();
  });

  it('should terminate repeat and throw if source subscription to _complete throws when repeating infinitely', () => {
    const e1 = Observable.of<number>(1, 2, rxTestScheduler);
    e1.subscribe(() => {
      //noop
    }, () => {
      //noop
    }, () => { throw new Error('error'); });

    expect(() => {
      e1.repeat();
      rxTestScheduler.flush();
    }).to.throw();
  });

  it('should raise error after first emit succeed', () => {
    let repeated = false;

    const e1 = cold('--a--|').map((x: string) => {
      if (repeated) {
        throw 'error';
      } else {
        repeated = true;
        return x;
      }
    });
    const expected = '--a----#';

    expectObservable(e1.repeat(2)).toBe(expected);
  });

  it('should repeat a synchronous source (multicasted and refCounted) multiple times', (done: MochaDone) => {
    const expected = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3];

    Observable.of(1, 2, 3)
      .multicast(() => new Rx.Subject<number>())
      .refCount()
      .repeat(5)
      .subscribe(
        (x: number) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          expect(expected.length).to.equal(0);
          done();
        });
  });
});
