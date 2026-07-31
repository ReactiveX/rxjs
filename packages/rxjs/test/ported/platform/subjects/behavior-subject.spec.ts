// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/subjects/BehaviorSubject-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { behaviorSubject as createBehaviorSubject } from 'rxjs/behavior-subject';
import { mergeMap } from 'rxjs/merge-map';
import { tap } from 'rxjs/tap';
describe('BehaviorSubject (platform)', () => {
  it('should replay the previous value when subscribed', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const behaviorSubject = createBehaviorSubject('0');
      function feedNextIntoSubject(x) {
        behaviorSubject.next(x);
      }
      function feedErrorIntoSubject(err) {
        behaviorSubject.error(err);
      }
      function feedCompleteIntoSubject() {
        behaviorSubject.complete();
      }
      const sourceTemplate = ' -1-2-3----4------5-6---7--8----9--|';
      const subscriber1 = hot('------(a|)                         ')[mergeMap](() => behaviorSubject);
      const unsub1 = '         ---------------------!             ';
      const expected1 = '      ------3---4------5-6--             ';
      const subscriber2 = hot('------------(b|)                   ')[mergeMap](() => behaviorSubject);
      const unsub2 = '         -------------------------!         ';
      const expected2 = '      ------------4----5-6---7--         ';
      const subscriber3 = hot('---------------------------(c|)    ')[mergeMap](() => behaviorSubject);
      const expected3 = '      ---------------------------8---9--|';
      expectObservable(
        hot(sourceTemplate)[tap]({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject })
      ).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });
  });
  it('should emit complete when subscribed after completed', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const behaviorSubject = createBehaviorSubject('0');
      function feedNextIntoSubject(x) {
        behaviorSubject.next(x);
      }
      function feedErrorIntoSubject(err) {
        behaviorSubject.error(err);
      }
      function feedCompleteIntoSubject() {
        behaviorSubject.complete();
      }
      const sourceTemplate = ' -1-2-3--4--|       ';
      const subscriber1 = hot('---------------(a|)')[mergeMap](() => behaviorSubject);
      const expected1 = '      ---------------|   ';
      expectObservable(
        hot(sourceTemplate)[tap]({ next: feedNextIntoSubject, error: feedErrorIntoSubject, complete: feedCompleteIntoSubject })
      ).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });
  });
});
