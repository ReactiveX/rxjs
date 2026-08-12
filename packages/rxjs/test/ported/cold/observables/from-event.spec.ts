// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/fromEvent-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
describe('fromEvent (cold)', () => {
  it('should create an observable of click on the element', async () => {
    await rxTest(({ expectObservable, schedule }) => {
      const target = new EventTarget();
      const result = target.when('click')[mergeMap](() => ColdObservable.from(['ev']));
      // Use the platform EventTarget contract required by the current fromEvent
      // boundary and reproduce the original two listener callbacks at frames 5
      // and 7. The finite observer horizon replaces the source's concat(NEVER).
      schedule(() => target.dispatchEvent(new Event('click')), 5);
      schedule(() => target.dispatchEvent(new Event('click')), 7);
      expectObservable(result, '^----------!').toBe('-----x-x---', { x: 'ev' });
    });
  });
});
