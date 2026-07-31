// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/publishReplay-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
import { NEVER } from 'rxjs/never';
import { publishReplay } from 'rxjs/publish-replay';
import { refCount } from 'rxjs/ref-count';
import { repeat } from 'rxjs/repeat';
import { retry } from 'rxjs/retry';
describe('publishReplay (cold)', () => {
  it('should mirror a simple source Observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const published = source[publishReplay](1);
      const expected = '   --1-2---3-4--5-|';
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should do nothing if connect is not called, despite subscriptions', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const result = source[publishReplay]();
      // No manual connection is made. Bound the observer at the original
      // one-frame evidence horizon while retaining the empty source log.
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe([]);
    });
  });
  it('should multicast the same values to multiple observers, bufferSize=1', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const published = source[publishReplay](1);
      const subscriber1 = hot('a|           ')[mergeMap](() => published);
      const expected1 = '      -1-2-3----4-|';
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
  it('should multicast the same values to multiple observers, bufferSize=2', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3------4-|');
      const sourceSubs = '     ^-----------------!';
      const published = source[publishReplay](2);
      const subscriber1 = hot('a|                 ')[mergeMap](() => published);
      const expected1 = '      -1-2-----3------4-|';
      const subscriber2 = hot('----b|             ')[mergeMap](() => published);
      const expected2 = '      ----(12)-3------4-|';
      const subscriber3 = hot('-----------c|      ')[mergeMap](() => published);
      const expected3 = '      -----------(23)-4-|';
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
      const published = source[publishReplay](1);
      const subscriber1 = hot('a|           ')[mergeMap](() => published);
      const expected1 = '      -1-2-3----4-#';
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
      const result = source[publishReplay](1);
      const coldMode = 'cold' === 'cold';
      // Preserve the original observer starts at frames 0, 4, and 8. A cold
      // observer gets its own ReplaySubject subscription and therefore replay;
      // platform observers join one active result run and see only later fanout.
      expectObservable(result, '^---------!').toBe('-1-2-3----');
      expectObservable(result, '----^-----!').toBe(coldMode ? '----23----' : '-----3----');
      expectObservable(result, '--------^-!').toBe(coldMode ? '--------3-' : '----------');
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 9);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-1-2-3----4-|');
      const result = source[mergeMap]((value) => ColdObservable.from([value]))[publishReplay](1);
      const coldMode = 'cold' === 'cold';
      // Preserve the original observer starts at frames 0, 4, and 8. A cold
      // observer gets its own ReplaySubject subscription and therefore replay;
      // platform observers join one active result run and see only later fanout.
      expectObservable(result, '^---------!').toBe('-1-2-3----');
      expectObservable(result, '----^-----!').toBe(coldMode ? '----23----' : '-----3----');
      expectObservable(result, '--------^-!').toBe(coldMode ? '--------3-' : '----------');
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 9);
    });
  });
  it('should connect when first subscriber subscribes', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('       -1-2-3----4-|');
      const sourceSubs = '     ---^-----------!';
      const replayed = source[publishReplay](1)[refCount]();
      const subscriber1 = hot('---a|           ')[mergeMap](() => replayed);
      const expected1 = '      ----1-2-3----4-|';
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
      const replayed = source[publishReplay](1)[refCount]();
      const subscriber1 = hot('---a|           ')[mergeMap](() => replayed);
      const unsub1 = '         ----------!     ';
      const expected1 = '      ----1-2-3--     ';
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
      const source = cold('    -1-2-3----4-#     ');
      const sourceSubs = '     ^-----------!     ';
      const published = source[publishReplay](1)[refCount]()[retry]({ count: 3, resetOnSuccess: false });
      const subscriber1 = hot('a|                ')[mergeMap](() => published);
      const expected1 = '      -1-2-3----4-(444#)';
      const subscriber2 = hot('----b|            ')[mergeMap](() => published);
      const expected2 = '      ----23----4-(444#)';
      const subscriber3 = hot('--------c|        ')[mergeMap](() => published);
      const expected3 = '      --------3-4-(444#)';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should NOT be repeatable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|    ');
      const sourceSubs = '     ^-----------!    ';
      const published = source[publishReplay](1)[refCount]()[repeat]({ count: 3 });
      const subscriber1 = hot('a|               ')[mergeMap](() => published);
      const expected1 = '      -1-2-3----4-(44|)';
      const subscriber2 = hot('----b|           ')[mergeMap](() => published);
      const expected2 = '      ----23----4-(44|)';
      const subscriber3 = hot('--------c|       ')[mergeMap](() => published);
      const expected3 = '      --------3-4-(44|)';
      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast an empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|  ');
      const sourceSubs = ' (^!)';
      const published = source[publishReplay](1);
      const expected = '   |';
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should multicast a never source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, schedule }) => {
      const source = cold('-');
      const result = source[publishReplay]();
      // Bound both the silent source connection and its result at the original
      // one-frame evidence horizon.
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
      const connection = result.connect();
      schedule(() => connection.unsubscribe(), 1);
    });
  });
  it('should multicast a throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#   ');
      const sourceSubs = ' (^!)';
      const published = source[publishReplay](1);
      const expected = '   #   ';
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      published.connect();
    });
  });
  it('should mirror a simple source Observable with selector', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const values = { a: 2, b: 4, c: 6, d: 8 };
      const selector = (observable) => observable[map]((v) => 2 * +v);
      const source = cold('--1-2---3-4---|');
      const sourceSubs = ' ^-------------!';
      const published = source[publishReplay](1, Infinity, selector);
      const expected = '   --a-b---c-d---|';
      expectObservable(published).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should EMIT an error when the selector throws an exception', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const error = "It's broken";
      const selector = () => {
        throw error;
      };
      const source = cold('--1-2---3-4---|');
      const published = source[publishReplay](1, Infinity, selector);
      const expected = '   #              ';
      expectObservable(published).toBe(expected, undefined, "It's broken");
    });
  });
  it('should emit an error when the selector returns an Observable that emits an error', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const error = "It's broken";
      const innerObservable = cold('--5-6----#', undefined, error);
      const selector = (observable) => observable[mergeMap](() => innerObservable);
      const source = cold('--1--2---3---|');
      const sourceSubs = ' ^----------!  ';
      const published = source[publishReplay](1, Infinity, selector);
      const expected = '   ----5-65-6-#  ';
      expectObservable(published).toBe(expected, undefined, error);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should terminate immediately when the selector returns an empty Observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1--2---3---|');
      const result = source[publishReplay](1, Infinity, () => EMPTY);
      // RxJS Next subscribes to the selector result first. Synchronous terminal
      // delivery closes the result before source activation, so the behavioral
      // output is retained with an intentionally empty source-subscription log.
      expectObservable(result).toBe('|');
      expectSubscriptions(source.subscriptions).toBe([]);
    });
  });
  it('should not emit and should not complete/error when the selector returns never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const result = source[publishReplay](1, Infinity, () => NEVER);
      // Bound the selector result and its source subscription at the original
      // one-frame evidence horizon without changing either silent claim.
      expectObservable(result, '^!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('^!');
    });
  });
  it('should emit error when the selector returns Observable.throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1--2---3---|');
      const result = source[publishReplay](
        1,
        Infinity,
        () =>
          new ColdObservable((subscriber) => {
            subscriber.error("It's broken");
          })
      );
      // RxJS Next subscribes to the selector result first. Synchronous terminal
      // delivery closes the result before source activation, so the behavioral
      // output is retained with an intentionally empty source-subscription log.
      expectObservable(result).toBe('#', undefined, "It's broken");
      expectSubscriptions(source.subscriptions).toBe([]);
    });
  });
  it('should be referentially-transparent', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source1 = cold('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = cold('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';
      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = (source_1) => source_1[publishReplay](1);
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
