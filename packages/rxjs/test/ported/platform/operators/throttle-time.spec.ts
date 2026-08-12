// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/throttleTime-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { throttle } from 'rxjs/throttle';
describe('throttleTime (platform)', () => {
  it('should immediately emit the first value in each time window', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y----b---x-cx---|');
      //                 ----|    ----| ----|
      const expected = '-a--------b-----c----|';
      const subs = '    ^--------------------!';
      const result = e1[throttle](5);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should simply mirror the source if values are not emitted often enough', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b-----c----|');
      const subs = '    ^--------------------!';
      const expected = '-a--------b-----c----|';
      expectObservable(e1[throttle](5)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a busy producer emitting a regular repeating sequence', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const subs = '    ^------------------------!';
      const expected = 'a-----a-----a-----a-----a|';
      expectObservable(e1[throttle](5)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const subs = '    ^----!';
      const expected = '-----|';
      expectObservable(e1[throttle](5)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should raise error when source does not emit and raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const subs = '    ^----!';
      const expected = '-----#';
      expectObservable(e1[throttle](10)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle an empty source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const subs = '    (^!)';
      const expected = '|';
      expectObservable(e1[throttle](30)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const subs = '^!';
      const expected = '-';
      expectObservable(e1[throttle](30), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle a throw source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const subs = '    (^!)';
      const expected = '#';
      expectObservable(e1[throttle](30)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should throttle and does not complete when source does not completes', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d----------------');
      const unsub = '   -------------------------------!';
      const subs = '    ^------------------------------!';
      const expected = '-a-------------d----------------';
      expectObservable(e1[throttle](5), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d----------------');
      const subs = '    ^------------------------------!';
      const expected = '-a-------------d----------------';
      const unsub = '   -------------------------------!';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [throttle](5)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should throttle values until source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d---------------#');
      const subs = '    ^------------------------------!';
      const expected = '-a-------------d---------------#';
      expectObservable(e1[throttle](5)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should immediately emit the first and last values in each time window', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-xy-----b--x--cxxx--|');
      const e1subs = '  ^---------------------!';
      const t = time('   ----|                 ');
      //                     ----|----|---|---|
      const expected = '-a---y----b---x---x---(x|)';
      const result = e1[throttle](t, { trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit the value if only a single one is given', async () => {
    await rxTest(({ hot, time, expectObservable }) => {
      const e1 = hot('  -a--------------------|');
      const t = time('   ----|                 ');
      const expected = '-a--------------------|';
      const result = e1[throttle](t, { trailing: true });
      expectObservable(result).toBe(expected);
    });
  });
  it('should immediately emit the last value in each time window', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-xy-----b--x--cxxx--|');
      const e1subs = '  ^---------------------!';
      const t = time('   ----|                 ');
      //                 ----|---|----|---|---|
      const expected = '-----y--------x---x---(x|)';
      const result = e1[throttle](t, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit the last throttled value when complete', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-xy-----b--x--cxx-|');
      const e1subs = '  ^-------------------!';
      const t = time('   ----|               ');
      //                 ----|---|----|---|---|
      const expected = '-----y--------x---x-|';
      const result = e1[throttle](t, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit the value if only a single one is given', async () => {
    await rxTest(({ hot, time, expectObservable }) => {
      const e1 = hot('  -a--------------------|');
      const t = time('   ----|                 ');
      const expected = '-----a----------------|';
      const result = e1[throttle](t, { leading: false, trailing: true });
      expectObservable(result).toBe(expected);
    });
  });
});
