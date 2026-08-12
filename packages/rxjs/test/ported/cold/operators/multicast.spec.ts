// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/multicast-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { concat } from 'rxjs/concat';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { multicast } from 'rxjs/multicast';
import { refCount } from 'rxjs/ref-count';
import { repeat } from 'rxjs/repeat';
import { replaySubject as createReplaySubject } from 'rxjs/replay-subject';
import { retry } from 'rxjs/retry';
import { Subject } from 'rxjs/subject';
import { takeLast } from 'rxjs/take-last';
import { zip } from 'rxjs/zip';
describe('multicast (cold)', () => {
  it('should mirror a simple source Observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --1-2---3-4--5-|');
      const e1subs = '  ^--------------!';
      const expected = '--1-2---3-4--5-|';
      const result = e1[multicast](() => new Subject());
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      result.connect();
    });
  });
  it('should accept a multicast selector and connect to a hot source for each subscriber', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new Subject();
      const selector = (x) => zip([x, x])[map](([a, b]) => (parseInt(a) + parseInt(b)).toString());
      const e1 = hot('         -1-2-3----4-|');
      // prettier-ignore
      const e1subs = [
                '                      ^-----------!',
                '                      ----^-------!',
                '                      --------^---!',
            ];
      const multicasted = e1[multicast](subjectFactory, selector);
      const subscriber1 = hot('a|           ')[mergeMap](() => multicasted);
      const expected1 = '      -2-4-6----8-|';
      const subscriber2 = hot('----b|       ')[mergeMap](() => multicasted);
      const expected2 = '      -----6----8-|';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => multicasted);
      const expected3 = '      ----------8-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should accept a multicast selector and connect to a cold source for each subscriber', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new Subject();
      const selector = (x) => zip([x, x])[map](([a, b]) => (parseInt(a) + parseInt(b)).toString());
      const e1 = cold('        -1-2-3----4-|        ');
      //                           -1-2-3----4-|
      //                               -1-2-3----4-|
      const e1subs = [
        '                      ^-----------!        ',
        '                      ----^-----------!    ',
        '                      --------^-----------!',
      ];
      const multicasted = e1[multicast](subjectFactory, selector);
      const subscriber1 = hot('a|                   ')[mergeMap](() => multicasted);
      const expected1 = '      -2-4-6----8-|        ';
      const subscriber2 = hot('----b|               ')[mergeMap](() => multicasted);
      const expected2 = '      -----2-4-6----8-|    ';
      const subscriber3 = hot('--------c|           ')[mergeMap](() => multicasted);
      const expected3 = '      ---------2-4-6----8-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it("should accept a multicast selector and respect the subject's messaging semantics", async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => createReplaySubject({ size: 1, maxAge: Infinity });
      const selector = (x) => ColdObservable[concat]([x, x[takeLast](1)]);
      const e1 = cold('        -1-2-3----4-|           ');
      //                                   (4|)
      //                           -1-2-3----4-|
      //                                       (4|)
      //                               -1-2-3----4-|
      //                                           (4|)
      const e1subs = [
        '                      ^-----------!           ',
        '                      ----^-----------!       ',
        '                      --------^-----------!   ',
      ];
      const multicasted = e1[multicast](subjectFactory, selector);
      const subscriber1 = hot('a|                      ')[mergeMap](() => multicasted);
      const expected1 = '      -1-2-3----4-(4|)        ';
      const subscriber2 = hot('----b|                  ')[mergeMap](() => multicasted);
      const expected2 = '      -----1-2-3----4-(4|)    ';
      const subscriber3 = hot('--------c|              ')[mergeMap](() => multicasted);
      const expected3 = '      ---------1-2-3----4-(4|)';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should do nothing if connect is not called, despite subscriptions', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const result = source[multicast](() => new Subject());
      // No connection is made. Bound the silent observer at the full original
      // diagram horizon and retain the empty source-subscription claim.
      expectObservable(result, '^---------------!').toBe('----------------');
      expectSubscriptions(source.subscriptions).toBe([]);
    });
  });
  it('should multicast the same values to multiple observers', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold('        -1-2-3----4-|');
      const e1subs = '         ^-----------!';
      const multicasted = e1[multicast](() => new Subject());
      const subscriber1 = hot('a|           ')[mergeMap](() => multicasted);
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ')[mergeMap](() => multicasted);
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => multicasted);
      const expected3 = '      ----------4-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      multicasted.connect();
    });
  });
  it('should multicast an error from the source to multiple observers', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = cold('        -1-2-3----4-#');
      const e1subs = '         ^-----------!';
      const multicasted = e1[multicast](() => new Subject());
      const subscriber1 = hot('a|           ')[mergeMap](() => multicasted);
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ')[mergeMap](() => multicasted);
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => multicasted);
      const expected3 = '      ----------4-#';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      multicasted.connect();
    });
  });
  it('should multicast the same values to multiple observers, but is unsubscribed explicitly and early', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-1-2-3----4-|');
      const result = source[multicast](() => new Subject());
      // Preserve the three original subscription frames (0, 4, and 8). The
      // manual connection ends at frame 9; the still-live subject observations
      // are independently bounded at the diagrams' frame-10 horizon.
      expectObservable(result, '^---------!').toBe('-1-2-3----');
      expectObservable(result, '----^-----!').toBe('-----3----');
      expectObservable(result, '--------^-!').toBe('----------');
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 9);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-1-2-3----4-|');
      const result = source[mergeMap]((value) => ColdObservable.from([value]))[multicast](() => new Subject());
      // Preserve the three original subscription frames (0, 4, and 8). The
      // manual connection ends at frame 9; the still-live subject observations
      // are independently bounded at the diagrams' frame-10 horizon.
      expectObservable(result, '^---------!').toBe('-1-2-3----');
      expectObservable(result, '----^-----!').toBe('-----3----');
      expectObservable(result, '--------^-!').toBe('----------');
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 9);
    });
  });
  it('should multicast an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const multicasted = e1[multicast](() => new Subject());
      const expected = '|   ';
      expectObservable(multicasted).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      multicasted.connect();
    });
  });
  it('should multicast a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-');
      const result = source[multicast](() => new Subject());
      // Bound the silent result and its explicit manual connection at the
      // original one-frame evidence horizon.
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 1);
    });
  });
  it('should multicast a throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const multicasted = e1[multicast](() => new Subject());
      const expected = '#   ';
      expectObservable(multicasted).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      multicasted.connect();
    });
  });
  it('should connect when first subscriber subscribes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new Subject();
      const e1 = cold('           -1-2-3----4-|');
      const e1subs = '         ---^-----------!';
      const multicasted = e1[multicast](subjectFactory)[refCount]();
      const subscriber1 = hot('---a|           ')[mergeMap](() => multicasted);
      const expected1 = '      ----1-2-3----4-|';
      const subscriber2 = hot('-------b|       ')[mergeMap](() => multicasted);
      const expected2 = '      --------3----4-|';
      const subscriber3 = hot('-----------c|   ')[mergeMap](() => multicasted);
      const expected3 = '      -------------4-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should disconnect when last subscriber unsubscribes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subjectFactory = () => new Subject();
      const e1 = cold('           -1-2-3----4-|');
      const e1subs = '         ---^--------!   ';
      const multicasted = e1[multicast](subjectFactory)[refCount]();
      const subscriber1 = hot('---a|           ')[mergeMap](() => multicasted);
      const expected1 = '      ----1-2-3--     ';
      const unsub1 = '         ----------!     ';
      const subscriber2 = hot('-------b|       ')[mergeMap](() => multicasted);
      const expected2 = '      --------3----   ';
      const unsub2 = '         ------------!   ';
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should be retryable when cold source is synchronous', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('(123#)');
      const result = source[multicast](() => new Subject())[refCount]();
      // Preserve the two original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(result[retry]({ count: 3, resetOnSuccess: false })).toBe('(123123123123#)');
      expectObservable(result[retry]({ count: 3, resetOnSuccess: false }), '-^').toBe('-(123123123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '(^!)', '(^!)', '-(^!)', '-(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable with ReplaySubject and cold source is synchronous', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('(123#)');
      const result = source[multicast](() => createReplaySubject({ size: 1, maxAge: Infinity }))[refCount]();
      // Preserve the two original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(result[retry]({ count: 3, resetOnSuccess: false })).toBe('(123123123123#)');
      expectObservable(result[retry]({ count: 3, resetOnSuccess: false }), '-^').toBe('-(123123123123#)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '(^!)', '(^!)', '-(^!)', '-(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable when cold source is synchronous', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('(123|)');
      const result = source[multicast](() => new Subject())[refCount]();
      // Preserve the two original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(result[repeat]({ count: 5 })).toBe('(123123123123123|)');
      expectObservable(result[repeat]({ count: 5 }), '-^').toBe('-(123123123123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '(^!)', '(^!)', '(^!)', '-(^!)', '-(^!)', '-(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be repeatable with ReplaySubject and cold source is synchronous', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('(123|)');
      const result = source[multicast](() => createReplaySubject({ size: 1, maxAge: Infinity }))[refCount]();
      // Preserve the two original trigger frames directly. Nested expectations
      // created at frame 1 otherwise schedule against absolute frame 0.
      expectObservable(result[repeat]({ count: 5 })).toBe('(123123123123123|)');
      expectObservable(result[repeat]({ count: 5 }), '-^').toBe('-(123123123123123|)');
      expectSubscriptions(source.subscriptions).toBe(['(^!)', '(^!)', '(^!)', '(^!)', '(^!)', '-(^!)', '-(^!)', '-(^!)', '-(^!)', '-(^!)']);
    });
  });
  it('should be retryable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1-2-3----4-#                        ');
      const result = source[multicast](() => new Subject())[refCount]();
      const coldMode = 'cold' === 'cold';
      const firstExpected = coldMode ? '-1-2-3----4-#' : '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const secondPrefix = '-----3----4-';
      // Observe the shared ref-counted run at the original frames 0 and 4
      // without retaining the never-ending hot trigger fixtures. Cold-mode
      // operator subscriptions retain their individual terminal lifecycle while
      // the second ref-counted observer keeps the shared source retry/repeat run
      // active; platform mode shares that operator activation as well.
      expectObservable(result[retry]({ count: 2, resetOnSuccess: false })).toBe(firstExpected);
      expectObservable(result[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe(secondPrefix + '-1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be retryable using a ReplaySubject', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1-2-3----4-#                        ');
      const result = source[multicast](() => createReplaySubject({ size: 1, maxAge: Infinity }))[refCount]();
      const coldMode = 'cold' === 'cold';
      const firstExpected = coldMode ? '-1-2-3----4-(44#)' : '-1-2-3----4--1-2-3----4--1-2-3----4-#';
      const secondPrefix = coldMode ? '----23----4-' : '-----3----4-';
      // Observe the shared ref-counted run at the original frames 0 and 4
      // without retaining the never-ending hot trigger fixtures. Cold-mode
      // operator subscriptions retain their individual terminal lifecycle while
      // the second ref-counted observer keeps the shared source retry/repeat run
      // active; platform mode shares that operator activation as well.
      expectObservable(result[retry]({ count: 2, resetOnSuccess: false })).toBe(firstExpected);
      expectObservable(result[retry]({ count: 2, resetOnSuccess: false }), '----^').toBe(secondPrefix + '-1-2-3----4--1-2-3----4-#');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1-2-3----4-|                        ');
      const result = source[multicast](() => new Subject())[refCount]();
      const coldMode = 'cold' === 'cold';
      const firstExpected = coldMode ? '-1-2-3----4-|' : '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const secondPrefix = '-----3----4-';
      // Observe the shared ref-counted run at the original frames 0 and 4
      // without retaining the never-ending hot trigger fixtures. Cold-mode
      // operator subscriptions retain their individual terminal lifecycle while
      // the second ref-counted observer keeps the shared source retry/repeat run
      // active; platform mode shares that operator activation as well.
      expectObservable(result[repeat]({ count: 3 })).toBe(firstExpected);
      expectObservable(result[repeat]({ count: 3 }), '----^').toBe(secondPrefix + '-1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
  it('should be repeatable using a ReplaySubject', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-1-2-3----4-|                        ');
      const result = source[multicast](() => createReplaySubject({ size: 1, maxAge: Infinity }))[refCount]();
      const coldMode = 'cold' === 'cold';
      const firstExpected = coldMode ? '-1-2-3----4-(44|)' : '-1-2-3----4--1-2-3----4--1-2-3----4-|';
      const secondPrefix = coldMode ? '----23----4-' : '-----3----4-';
      // Observe the shared ref-counted run at the original frames 0 and 4
      // without retaining the never-ending hot trigger fixtures. Cold-mode
      // operator subscriptions retain their individual terminal lifecycle while
      // the second ref-counted observer keeps the shared source retry/repeat run
      // active; platform mode shares that operator activation as well.
      expectObservable(result[repeat]({ count: 3 })).toBe(firstExpected);
      expectObservable(result[repeat]({ count: 3 }), '----^').toBe(secondPrefix + '-1-2-3----4--1-2-3----4-|');
      expectSubscriptions(source.subscriptions).toBe([
        '^-----------!                        ',
        '------------^-----------!            ',
        '------------------------^-----------!',
      ]);
    });
  });
});
