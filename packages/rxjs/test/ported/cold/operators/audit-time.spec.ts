// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/auditTime-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { throttle } from 'rxjs/throttle';
describe('auditTime (cold)', () => {
  it('should emit the last value in each time window', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y----b---x-cx---|');
      const e1subs = '  ^--------------------!';
      const t = time('   -----|               ');
      //                          -----|
      //                                -----|
      const expected = '------y--------x-----(x|)';
      const result = e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should auditTime events multiple times', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -012-----01234---|');
      const e1subs = '  ^----------------!';
      const t = time('   -----|           ');
      //                         -----|
      const expected = '------2-------4--|';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay the source if values are not emitted often enough', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b-----c----|');
      const e1subs = '  ^--------------------!';
      const t = time('   -----|               ');
      //                          -----|
      //                                -----|
      const expected = '------a--------b-----(c|)';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a busy producer emitting a regular repeating sequence', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const t = time('  -----|                    ');
      //                      -----|
      //                            -----|
      //                                  -----|
      //                                        -----|
      const expected = '-----f-----f-----f-----f-----(a|)';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const t = time('  --|   ');
      const expected = '-----|';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source does not emit and raises error', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const e1subs = '  ^----!';
      const t = time('  --|   ');
      const expected = '-----#';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle an empty source', async () => {
    await rxTest(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const t = time('  ---|');
      const expected = '|   ';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -  ');
      const e1subs = '^!';
      const t = time('  --|');
      const expected = '-  ';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false }), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle a throw source', async () => {
    await rxTest(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const t = time('  ---|');
      const expected = '#   ';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete when source does not complete', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d----------------');
      const e1subs = '  ^------------------------------!';
      const t = time('   -----|                         ');
      //                               -----|
      const expected = '------c-------------d-----------';
      const unsub = '   -------------------------------!';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false }), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d----------------');
      const e1subs = '  ^------------------------------!';
      const t = time('   -----|                         ');
      //                               -----|
      const expected = '------c-------------d-----------';
      const unsub = '   -------------------------------!';
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [throttle](t, { leading: false, trailing: true, restartOnTrailing: false })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should auditTime values until source raises error', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d---------------#');
      const e1subs = '  ^------------------------------!';
      const t = time('   -----|                         ');
      //                               -----|
      const expected = '------c-------------d----------#';
      expectObservable(e1[throttle](t, { leading: false, trailing: true, restartOnTrailing: false })).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
