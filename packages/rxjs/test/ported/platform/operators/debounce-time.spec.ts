// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/debounceTime-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { debounce } from 'rxjs/debounce';
import { mergeMap } from 'rxjs/merge-map';
describe('debounceTime (platform)', () => {
  it('should debounce values by 2 time units', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--bc--d---|');
      const e1subs = '  ^-----------!';
      const expected = '---a---c--d-|';
      const t = time('  --|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay all elements by the specified time', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b------c----|');
      const e1subs = '  ^---------------------!';
      const expected = '------a--------b------(c|)';
      const t = time('  -----|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce and delay element by the specified time', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-----------d-------|');
      const e1subs = '  ^--------------------------!';
      const expected = '---------c--------------d--|';
      const t = time('  -----|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source does not emit', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const expected = '-----|';
      const t = time('  -|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should complete when source is empty', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const e1subs = '  (^!)';
      const expected = '|';
      const t = time('  -|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source does not emit and raises error', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const e1subs = '  ^----!';
      const expected = '-----#';
      const t = time('  -|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error when source throws', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      const t = time('  -|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';
      const t = time('  --|');
      const result = e1[debounce](t);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';
      const t = time('  --|');
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [debounce](t)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce and does not complete when source does not completes', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-----------d-------');
      const e1subs = '^--------------------------!';
      const expected = '---------c--------------d--';
      const t = time('  -----|');
      expectObservable(e1[debounce](t), '^--------------------------!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not completes when source does not completes', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '^!';
      const expected = '-';
      const t = time('  -|');
      expectObservable(e1[debounce](t), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not completes when source never completes', async () => {
    await rxTest(({ observable, time, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const t = time('  -|');
      expectObservable(e1[debounce](t), '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should delay all elements until source raises error', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b------c----#');
      const e1subs = '  ^---------------------!';
      const expected = '------a--------b------#';
      const t = time('  -----|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce all elements while source emits within given time', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--h-|');
      const e1subs = '  ^------------------------!';
      const expected = '-------------------------(h|)';
      const t = time('  ----|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should debounce all element while source emits within given time until raises error', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--h-#');
      const e1subs = '  ^------------------------!';
      const expected = '-------------------------#';
      const t = time('  ----|');
      expectObservable(e1[debounce](t)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
