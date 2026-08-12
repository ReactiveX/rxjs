// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/publishBehavior-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { publishBehavior } from 'rxjs/publish-behavior';
import { refCount } from 'rxjs/ref-count';
import { repeat } from 'rxjs/repeat';
import { retry } from 'rxjs/retry';
describe('publishBehavior (cold)', () => {
  it('should mirror a simple source Observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const published = source[publishBehavior]('0');
      const expected = '   0-1-2---3-4--5-|';
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should only emit default value if connect is not called, despite subscriptions', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const result = source[publishBehavior]('0');
      // No manual connection is made. Bound the observer at the original
      // one-frame evidence horizon while retaining the empty source log.
      expectObservable(result, '^!').toBe('0');
      expectSubscriptions(source.subscriptions).toBe([]);
    });
  });
  it('should multicast the same values to multiple observers', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('   -1-2-3----4-| ');
      const sourceSubs = '    ^-----------! ';
      const published = source[publishBehavior]('0');
      const subscriber1 = hot('a|           ')[mergeMap](() => published);
      const expected1 = '      01-2-3----4-|';
      const subscriber2 = hot('----b|       ')[mergeMap](() => published);
      const expected2 = '      ----23----4-|';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => published);
      const expected3 = '      --------3-4-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should multicast an error from the source to multiple observers', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const published = source[publishBehavior]('0');
      const subscriber1 = hot('a|           ')[mergeMap](() => published);
      const expected1 = '      01-2-3----4-#';
      const subscriber2 = hot('----b|       ')[mergeMap](() => published);
      const expected2 = '      ----23----4-#';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => published);
      const expected3 = '      --------3-4-#';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should multicast the same values to multiple observers, but is unsubscribed explicitly and early', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-1-2-3----4-|');
      const result = source[publishBehavior]('0');
      const platformSharedRun = 'cold' !== 'cold';
      const secondExpected = platformSharedRun && 'publishBehavior' === 'publishBehavior' ? '-----3----' : '----23----';
      const thirdExpected = platformSharedRun && 'publishBehavior' === 'publishBehavior' ? '----------' : '--------3-';
      // Preserve the original observer starts at frames 0, 4, and 8. Disconnect
      // the source at frame 9 and release the live subject observers at the
      // diagrams' frame-10 horizon. Platform-mode observers join the existing
      // shared activation, so publishBehavior does not synchronously replay its
      // current subject value for those later logical observations.
      expectObservable(result, '^---------!').toBe('01-2-3----');
      expectObservable(result, '----^-----!').toBe(secondExpected);
      expectObservable(result, '--------^-!').toBe(thirdExpected);
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 9);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-1-2-3----4-|');
      const result = source[mergeMap]((value) => ColdObservable.from([value]))[publishBehavior]('0');
      const platformSharedRun = 'cold' !== 'cold';
      const secondExpected = platformSharedRun && 'publishBehavior' === 'publishBehavior' ? '-----3----' : '----23----';
      const thirdExpected = platformSharedRun && 'publishBehavior' === 'publishBehavior' ? '----------' : '--------3-';
      // Preserve the original observer starts at frames 0, 4, and 8. Disconnect
      // the source at frame 9 and release the live subject observers at the
      // diagrams' frame-10 horizon. Platform-mode observers join the existing
      // shared activation, so publishBehavior does not synchronously replay its
      // current subject value for those later logical observations.
      expectObservable(result, '^---------!').toBe('01-2-3----');
      expectObservable(result, '----^-----!').toBe(secondExpected);
      expectObservable(result, '--------^-!').toBe(thirdExpected);
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 9);
    });
  });
  it('should connect when first subscriber subscribes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const replayed = source[publishBehavior]('0')[refCount]();
      const subscriber1 = hot('---a|           ')[mergeMap](() => replayed);
      const expected1 = '      ---01-2-3----4-|';
      const subscriber2 = hot('-------b|       ')[mergeMap](() => replayed);
      const expected2 = '      -------23----4-|';
      const subscriber3 = hot('-----------c|   ')[mergeMap](() => replayed);
      const expected3 = '      -----------3-4-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should disconnect when last subscriber unsubscribes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('       -1-2-3----4-|');
      const sourceSubs = '     ---^--------!   ';
      const replayed = source[publishBehavior]('0')[refCount]();
      const subscriber1 = hot('---a|           ')[mergeMap](() => replayed);
      const unsub1 = '         ----------!     ';
      const expected1 = '      ---01-2-3--     ';
      const subscriber2 = hot('-------b|       ')[mergeMap](() => replayed);
      const unsub2 = '         ------------!   ';
      const expected2 = '      -------23----   ';
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should NOT be retryable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const published = source[publishBehavior]('0')[refCount]()[retry]({ count: 3, resetOnSuccess: false });
      const subscriber1 = hot('a|           ')[mergeMap](() => published);
      const expected1 = '      01-2-3----4-#';
      const subscriber2 = hot('----b|       ')[mergeMap](() => published);
      const expected2 = '      ----23----4-#';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => published);
      const expected3 = '      --------3-4-#';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should NOT be repeatable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const published = source[publishBehavior]('0')[refCount]()[repeat]({ count: 3 });
      const subscriber1 = hot('a|           ')[mergeMap](() => published);
      const expected1 = '      01-2-3----4-|';
      const subscriber2 = hot('----b|       ')[mergeMap](() => published);
      const expected2 = '      ----23----4-|';
      const subscriber3 = hot('--------c|   ')[mergeMap](() => published);
      const expected3 = '      --------3-4-|';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const sourceSubs = ' (^!)';
      const published = source[publishBehavior]('0');
      const expected = '   (0|)';
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should multicast a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-');
      const result = source[publishBehavior]('0');
      // Bound both the silent source connection and its result at the original
      // one-frame evidence horizon.
      expectObservable(result, '^!').toBe('0');
      expectSubscriptions(source.subscriptions).toBe('^!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 1);
    });
  });
  it('should multicast a throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#  ');
      const sourceSubs = ' (^!)';
      const published = source[publishBehavior]('0');
      const expected = '   (0#)';
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should be referentially-transparent', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source1 = cold('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   x1-2-3-4-5-|';
      const source2 = cold('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   x6-7-8-9-0-|';
      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = (source_1) => source_1[publishBehavior]('x');
      // The non-referentially-transparent publishing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const published1 = partialPipeLine(source1);
      const published2 = partialPipeLine(source2);
      expectObservable(published1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(published2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);
      published1.connect();
      published2.connect();
    });
  });
});
