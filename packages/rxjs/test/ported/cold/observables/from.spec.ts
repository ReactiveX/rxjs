// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/from-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { delay } from 'rxjs/delay';
import { mergeMap } from 'rxjs/merge-map';
describe('from (cold)', () => {
  it('should create an observable from an array', async () => {
    await rxTest(({ expectObservable, time }) => {
      const delayTime = time('--|');
      const result = ColdObservable.from([10, 20, 30])[mergeMap](
        (value, index) => ColdObservable.from([value])[delay](index === 0 ? 0 : delayTime),
        { concurrent: 1 }
      );
      expectObservable(result).toBe('x-y-(z|)', { x: 10, y: 20, z: 30 });
    });
  });
});
