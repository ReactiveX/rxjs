// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/sampleTime-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { sampleTime } from 'rxjs/sample-time';
describe('sampleTime (platform)', () => {
  it('should get samples on a delay', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('     a---b-c---------d--e---f-g-h--|');
      const e1subs = '     ^-----------------------------!';
      const expected = '   -------c-------------e------h-|';
      // period            -------!------!------!------!--
      const period = time('-------|                       ');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should sample nothing if new value has not arrived', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  ----a-^--b----c--------------f----|');
      const e1subs = '        ^---------------------------!';
      const expected = '      -----------c----------------|';
      // period               -----------!----------!---------
      const period = time('   -----------|                 ');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should sample if new value has arrived, even if it is the same value', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----------c---f----|');
      const e1subs = '      ^---------------------------!';
      const expected = '    -----------c----------c-----|';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should sample nothing if source has not nexted by time of sample', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^-------------b-------------|');
      const e1subs = '      ^---------------------------!';
      const expected = '    ----------------------b-----|';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----d----#');
      const e1subs = '      ^-----------------!';
      const expected = '    -----------c------#';
      // period             -----------!----------!---------
      const period = time(' -----------|       ');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing explicitly and early', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----d----e----f----|');
      const unsub = '       ----------------!            ';
      const e1subs = '      ^---------------!            ';
      const expected = '    -----------c-----            ';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');
      expectObservable(e1[sampleTime](period), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('----a-^--b----c----d----e----f----|');
      const e1subs = '      ^---------------!            ';
      // period             -----------!----------!---------
      const period = time(' -----------|                 ');
      const expected = '    -----------c-----            ';
      const unsub = '       ----------------!            ';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [sampleTime](period)
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should completes if source does not emits', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable('    |     ');
      const e1subs = '     (^!)  ';
      const expected = '   |     ';
      const period = time('-----|');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should raise error if source throws immediately', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable('    #     ');
      const e1subs = '     (^!)  ';
      const expected = '   #     ';
      const period = time('-----|');
      expectObservable(e1[sampleTime](period)).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not complete if source does not complete', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions, time }) => {
      const e1 = observable('    --------');
      const e1subs = '     ^------!';
      const expected = '   --------';
      const period = time('-----|  ');
      const e1unsbs = '    -------!';
      expectObservable(e1[sampleTime](period), e1unsbs).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
