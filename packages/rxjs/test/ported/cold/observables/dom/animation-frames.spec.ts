// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/dom/animationFrames-spec.ts
import { describe, it, vi } from 'vitest';
import { rxTest } from '@rxjs/test';
import { animationFrames } from 'rxjs/animation-frames';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { take } from 'rxjs/take';
import { takeUntil } from 'rxjs/take-until';
describe('animationFrames (cold)', () => {
  it('should animate', async () => {
    await rxTest(({ animate, cold, expectObservable, time }) => {
      animate('            ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const tc = time('    -----------|');
      const expected = '   ---a---b---c';
      const subs = '^-----------!';
      const result = mapped[mergeMap](() => ColdObservable[animationFrames]());
      expectObservable(result, subs).toBe(expected, {
        a: { elapsed: ta - tm, timestamp: ta },
        b: { elapsed: tb - tm, timestamp: tb },
        c: { elapsed: tc - tm, timestamp: tc },
      });
    });
  });
  it('should use any passed timestampProvider', async () => {
    let i = 0;
    const timestampProvider = {
      now: vi.fn(() => {
        return [50, 100, 200, 300][i++];
      }),
    };
    await rxTest(({ animate, cold, expectObservable }) => {
      animate('            ---x---x---x');
      const mapped = cold('-m          ');
      const expected = '   ---a---b---c';
      const subs = '^-----------!';
      const result = mapped[mergeMap](() => ColdObservable[animationFrames](timestampProvider));
      expectObservable(result, subs).toBe(expected, {
        a: { elapsed: 50, timestamp: 100 },
        b: { elapsed: 150, timestamp: 200 },
        c: { elapsed: 250, timestamp: 300 },
      });
    });
  });
  it('should compose with take', async () => {
    await rxTest(({ animate, cold, expectObservable, time }) => {
      animate('---x---x---x');
      const mapped = cold('-m');
      const tm = time('-|');
      const ta = time('---|');
      const tb = time('-------|');
      const frames = ColdObservable[animationFrames]()[take](2);
      const result = mapped[mergeMap](() => frames);
      expectObservable(result, '^-----------!').toBe('---a---b', {
        a: { elapsed: ta - tm, timestamp: ta },
        b: { elapsed: tb - tm, timestamp: tb },
      });
    });
  });
  it('should compose with takeUntil', async () => {
    await rxTest(({ animate, cold, expectObservable, hot, time }) => {
      animate('---x---x---x');
      const mapped = cold('-m');
      const tm = time('-|');
      const ta = time('---|');
      const tb = time('-------|');
      const signal = hot('^--------s--');
      const frames = ColdObservable[animationFrames]()[takeUntil](signal);
      const result = mapped[mergeMap](() => frames);
      expectObservable(result, '^-----------!').toBe('---a---b', {
        a: { elapsed: ta - tm, timestamp: ta },
        b: { elapsed: tb - tm, timestamp: tb },
      });
    });
  });
});
