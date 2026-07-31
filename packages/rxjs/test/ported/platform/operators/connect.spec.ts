// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/connect-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { behaviorSubject as createBehaviorSubject } from 'rxjs/behavior-subject';
import { connect } from 'rxjs/connect';
import { delay } from 'rxjs/delay';
import { merge } from 'rxjs/merge';
describe('connect (platform)', () => {
  it('should connect a source through a selector function', async () => {
    await rxTest(({ observable, time, expectObservable }) => {
      const source = observable('---a----b-----c---|');
      const d = time('        ---|');
      const expected = '   ---a--a-b--b--c--c|';
      const result = source[connect]((shared) => Observable[merge]([shared[delay](d), shared]));
      expectObservable(result).toBe(expected);
    });
  });
  it('should connect a source through a selector function and use the provided connector', async () => {
    await rxTest(({ observable, time, expectObservable }) => {
      const source = observable('--------a---------b---------c-----|');
      const d = time('             ---|');
      const expected = '   S--S----a--a------b--b------c--c--|';
      const result = source[connect](
        (shared) => {
          return Observable[merge]([shared[delay](d), shared]);
        },
        {
          connector: () => createBehaviorSubject('S'),
        }
      );
      expectObservable(result).toBe([
        { frame: 3, notification: { kind: 'N', value: 'S' } },
        { frame: 8, notification: { kind: 'N', value: 'a' } },
        { frame: 11, notification: { kind: 'N', value: 'a' } },
        { frame: 18, notification: { kind: 'N', value: 'b' } },
        { frame: 21, notification: { kind: 'N', value: 'b' } },
        { frame: 28, notification: { kind: 'N', value: 'c' } },
        { frame: 31, notification: { kind: 'N', value: 'c' } },
        { frame: 34, notification: { kind: 'C' } },
      ]);
    });
  });
});
