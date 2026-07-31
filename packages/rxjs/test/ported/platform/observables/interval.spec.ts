// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/interval-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { interval } from 'rxjs/interval';
import { take } from 'rxjs/take';
describe('interval (platform)', () => {
  it('should set up an interval', async () => {
    await rxTest(({ expectObservable, time }) => {
      const period = time('----------|                                                                 ');
      //                             ----------|
      //                                       ----------|
      //                                                 ----------|
      //                                                           ----------|
      //                                                                     ----------|
      //                                                                               ----------|
      const unsubs = '     ---------------------------------------------------------------------------!';
      const expected = '   ----------0---------1---------2---------3---------4---------5---------6-----';
      expectObservable(Observable[interval](period), unsubs).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });
  it('should emit when relative interval set to zero', async () => {
    await rxTest(({ expectObservable, time }) => {
      const period = time('|         ');
      const expected = '   (0123456|)';
      const e1 = Observable[interval](period)[take](7);
      expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });
  it('should consider negative interval as zero', async () => {
    await rxTest(({ expectObservable }) => {
      const expected = '(0123456|)';
      const e1 = Observable[interval](-1)[take](7);
      expectObservable(e1).toBe(expected, [0, 1, 2, 3, 4, 5, 6]);
    });
  });
});
