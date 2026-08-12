// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/subjects/ReplaySubject-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { replaySubject as createReplaySubject } from 'rxjs/replay-subject';
import { tap } from 'rxjs/tap';
describe('ReplaySubject (cold)', () => {
  it('should replay 2 previous values when subscribed', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const replaySubject = createReplaySubject({ size: 2, maxAge: Infinity });
      function feedNextIntoSubject(x) {
        replaySubject.next(x);
      }
      function feedErrorIntoSubject(err) {
        replaySubject.error(err);
      }
      function feedCompleteIntoSubject() {
        replaySubject.complete();
      }
      const sourceTemplate = ' -1-2-3----4------5-6---7--8----9--|';
      const subscriber1 = hot('------(a|)                         ')[mergeMap](() => replaySubject);
      const unsub1 = '         ---------------------!             ';
      const expected1 = '      ------(23)4------5-6--             ';
      const subscriber2 = hot('------------(b|)                   ')[mergeMap](() => replaySubject);
      const unsub2 = '         -------------------------!         ';
      const expected2 = '      ------------(34)-5-6---7--         ';
      const subscriber3 = hot('---------------------------(c|)    ')[mergeMap](() => replaySubject);
      const expected3 = '      ---------------------------(78)9--|';
      expectObservable(
        hot(sourceTemplate)[tap]({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject })
      ).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });
  });
  it('should replay 2 last values for when subscribed after completed', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const replaySubject = createReplaySubject({ size: 2, maxAge: Infinity });
      function feedNextIntoSubject(x) {
        replaySubject.next(x);
      }
      function feedErrorIntoSubject(err) {
        replaySubject.error(err);
      }
      function feedCompleteIntoSubject() {
        replaySubject.complete();
      }
      const sourceTemplate = ' -1-2-3--4--|';
      const subscriber1 = hot('---------------(a|) ')[mergeMap](() => replaySubject);
      const expected1 = '      ---------------(34|)';
      expectObservable(
        hot(sourceTemplate)[tap]({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject })
      ).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });
  });
  it('should replay previous values since 4 time units ago when subscribed', async () => {
    await rxTest(async ({ flush, now, schedule }) => {
      const replaySubject = createReplaySubject({ size: Infinity, maxAge: 4 });
      const controllers = Array.from({ length: 3 }, () => new AbortController());
      const results = Array.from({ length: 3 }, () => []);
      for (const [frame, value] of [
        [1, '1'],
        [3, '2'],
        [5, '3'],
        [10, '4'],
        [17, '5'],
        [19, '6'],
        [24, '7'],
        [26, '8'],
        [31, '9'],
      ]) {
        schedule(() => replaySubject.next(value), frame);
      }
      schedule(() => replaySubject.complete(), 34);
      schedule(() => {
        replaySubject.subscribe(
          {
            next: (value) => results[0].push([now(), 'N', value]),
            error: (error) => results[0].push([now(), 'E', error]),
            complete: () => results[0].push([now(), 'C']),
          },
          { signal: controllers[0].signal }
        );
      }, 6);
      schedule(() => controllers[0].abort(), 21);
      schedule(() => {
        replaySubject.subscribe(
          {
            next: (value) => results[1].push([now(), 'N', value]),
            error: (error) => results[1].push([now(), 'E', error]),
            complete: () => results[1].push([now(), 'C']),
          },
          { signal: controllers[1].signal }
        );
      }, 12);
      schedule(() => controllers[1].abort(), 25);
      schedule(() => {
        replaySubject.subscribe(
          {
            next: (value) => results[2].push([now(), 'N', value]),
            error: (error) => results[2].push([now(), 'E', error]),
            complete: () => results[2].push([now(), 'C']),
          },
          { signal: controllers[2].signal }
        );
      }, 27);
      schedule(() => {
        for (const controller of controllers) {
          controller.abort();
        }
      }, 35);
      await flush();
      expect(results).toEqual([
        [
          [6, 'N', '2'],
          [6, 'N', '3'],
          [10, 'N', '4'],
          [17, 'N', '5'],
          [19, 'N', '6'],
        ],
        [
          [12, 'N', '4'],
          [17, 'N', '5'],
          [19, 'N', '6'],
          [24, 'N', '7'],
        ],
        [
          [27, 'N', '7'],
          [27, 'N', '8'],
          [31, 'N', '9'],
          [34, 'C'],
        ],
      ]);
    });
  });
  it('should replay last values since 4 time units ago when subscribed', async () => {
    await rxTest(async ({ flush, now, schedule }) => {
      const replaySubject = createReplaySubject({ size: Infinity, maxAge: 4 });
      const controllers = Array.from({ length: 1 }, () => new AbortController());
      const results = Array.from({ length: 1 }, () => []);
      for (const [frame, value] of [
        [1, '1'],
        [3, '2'],
        [5, '3'],
        [10, '4'],
      ]) {
        schedule(() => replaySubject.next(value), frame);
      }
      schedule(() => replaySubject.complete(), 11);
      schedule(() => {
        replaySubject.subscribe(
          {
            next: (value) => results[0].push([now(), 'N', value]),
            error: (error) => results[0].push([now(), 'E', error]),
            complete: () => results[0].push([now(), 'C']),
          },
          { signal: controllers[0].signal }
        );
      }, 13);
      schedule(() => {
        for (const controller of controllers) {
          controller.abort();
        }
      }, 14);
      await flush();
      expect(results).toEqual([
        [
          [13, 'N', '4'],
          [13, 'C'],
        ],
      ]);
    });
  });
  it('should only replay bufferSize items when 4 time units ago more were emitted', async () => {
    await rxTest(async ({ flush, now, schedule }) => {
      const replaySubject = createReplaySubject({ size: 2, maxAge: 4 });
      const controllers = Array.from({ length: 1 }, () => new AbortController());
      const results = Array.from({ length: 1 }, () => []);
      for (const [frame, value] of [
        [0, '1'],
        [1, '2'],
        [2, '3'],
        [3, '4'],
      ]) {
        schedule(() => replaySubject.next(value), frame);
      }
      schedule(() => replaySubject.complete(), 11);
      schedule(() => {
        replaySubject.subscribe(
          {
            next: (value) => results[0].push([now(), 'N', value]),
            error: (error) => results[0].push([now(), 'E', error]),
            complete: () => results[0].push([now(), 'C']),
          },
          { signal: controllers[0].signal }
        );
      }, 4);
      schedule(() => {
        for (const controller of controllers) {
          controller.abort();
        }
      }, 12);
      await flush();
      expect(results).toEqual([
        [
          [4, 'N', '3'],
          [4, 'N', '4'],
          [11, 'C'],
        ],
      ]);
    });
  });
});
