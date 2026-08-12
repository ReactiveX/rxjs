// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/connect-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { behaviorSubject as createBehaviorSubject } from 'rxjs/behavior-subject';
import { ColdObservable } from 'rxjs/cold-observable';
import { connect } from 'rxjs/connect';
import { delay } from 'rxjs/delay';
import { merge } from 'rxjs/merge';
describe('connect (cold)', () => {
  it('should connect a source through a selector function', async () => {
    await rxTest(({ cold, time, expectObservable }) => {
      const source = cold('---a----b-----c---|');
      const d = time('        ---|');
      const expected = '   ---a--a-b--b--c--c|';
      const result = source[connect]((shared) => ColdObservable[merge]([shared[delay](d), shared]));
      expectObservable(result).toBe(expected);
    });
  });
  it('should connect a source through a selector function and use the provided connector', async () => {
    await rxTest(({ cold, time, expectObservable }) => {
      const source = cold('--------a---------b---------c-----|');
      const d = time('             ---|');
      const expected = '   S--S----a--a------b--b------c--c--|';
      const result = source[connect](
        (shared) => {
          return ColdObservable[merge]([shared[delay](d), shared]);
        },
        {
          connector: () => createBehaviorSubject('S'),
        }
      );
      expectObservable(result).toBe(expected);
    });
  });
});
