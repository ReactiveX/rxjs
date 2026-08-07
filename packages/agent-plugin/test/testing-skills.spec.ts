import 'rxjs';
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { TestScheduler } from 'rxjs7/testing';
import { map as map7 } from 'rxjs7/operators';
import { map } from 'rxjs/map';

describe('version-specific testing skill examples', () => {
  it('runs the documented RxJS 7 TestScheduler pattern', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-a-b-|', { a: 1, b: 2 });
      expectObservable(source.pipe(map7((value) => value * 10))).toBe('-x-y-|', {
        x: 10,
        y: 20,
      });
      expectSubscriptions(source.subscriptions).toBe('^----!');
    });
  });

  it('runs the documented RxJS 9 platform-source pattern', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b--|', { a: 1, b: 2 });

      expectObservable(source[map]((value) => value * 10)).toBe('--x--y--|', {
        x: 10,
        y: 20,
      });
      expectObservable(source, '---^').toBe('-----b--|', { b: 2 });
      expectSubscriptions(source.subscriptions).toBe('^-------!');
    });
  });
});
