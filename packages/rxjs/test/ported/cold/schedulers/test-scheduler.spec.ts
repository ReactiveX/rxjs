// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/schedulers/TestScheduler-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { debounce } from 'rxjs/debounce';
import { delay } from 'rxjs/delay';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
describe('TestScheduler (cold)', () => {
  it('should exist', async () => {
    // The accepted public testing boundary is rxTest, not a constructible
    // TestScheduler with mutable parser and queue internals.
    expect(rxTest).toBeTypeOf('function');
  });
  it('should have frameTimeFactor set initially', async () => {
    await rxTest(({ time }) => {
      // Run-style virtual time is the RxJS Next contract: one millisecond per
      // marble frame, replacing the legacy static frameTimeFactor of ten.
      expect(time('-|')).toBe(1);
    });
  });
  it('should parse a marble string into a series of notifications and types', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      cold('-------a---b---|', { a: 'A', b: 'B' }).subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [7, 'N', 'A'],
        [11, 'N', 'B'],
        [15, 'C'],
      ]);
    });
  });
  it('should parse a marble string, allowing spaces too', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      cold('--a--b--|   ', { a: 'A', b: 'B' }).subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [2, 'N', 'A'],
        [5, 'N', 'B'],
        [8, 'C'],
      ]);
    });
  });
  it('should parse a marble string with a subscription point', async () => {
    await rxTest(async ({ hot, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      hot('---^---a---b---|', { a: 'A', b: 'B' }).subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [4, 'N', 'A'],
        [8, 'N', 'B'],
        [12, 'C'],
      ]);
    });
  });
  it('should parse a marble string with an error', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      cold('-------a---b---#', { a: 'A', b: 'B' }, 'omg error!').subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [7, 'N', 'A'],
        [11, 'N', 'B'],
        [15, 'E', 'omg error!'],
      ]);
    });
  });
  it('should default in the letter for the value if no value hash was passed', async () => {
    await rxTest(async ({ cold, flush, now, schedule }) => {
      const actual = [];
      const controller = new AbortController();
      cold('--a--b--c--').subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      schedule(() => controller.abort(), 9);
      await flush();
      expect(actual).toEqual([
        [2, 'N', 'a'],
        [5, 'N', 'b'],
        [8, 'N', 'c'],
      ]);
    });
  });
  it('should handle grouped values', async () => {
    await rxTest(async ({ cold, flush, now, schedule }) => {
      const actual = [];
      const controller = new AbortController();
      cold('---(abc)---').subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      schedule(() => controller.abort(), 4);
      await flush();
      expect(actual).toEqual([
        [3, 'N', 'a'],
        [3, 'N', 'b'],
        [3, 'N', 'c'],
      ]);
    });
  });
  it('should ignore whitespace when runMode=true', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      cold('  -a - b -    c |       ', { a: 'A', b: 'B', c: 'C' }).subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [1, 'N', 'A'],
        [3, 'N', 'B'],
        [5, 'N', 'C'],
        [6, 'C'],
      ]);
    });
  });
  it('should support time progression syntax when runMode=true', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      cold('10.2ms a 1.2s b 1m c|', { a: 'A', b: 'B', c: 'C' }).subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [10.2, 'N', 'A'],
        [1211.2, 'N', 'B'],
        [61212.2, 'N', 'C'],
        [61213.2, 'C'],
      ]);
    });
  });
  it('should support emoji characters', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const actual = [];
      const controller = new AbortController();
      cold('--🙈--🙉--🙊--|').subscribe(
        {
          next: (value) => actual.push([now(), 'N', value]),
          error: (error) => actual.push([now(), 'E', error]),
          complete: () => actual.push([now(), 'C']),
        },
        { signal: controller.signal }
      );
      await flush();
      expect(actual).toEqual([
        [2, 'N', '🙈'],
        [5, 'N', '🙉'],
        [8, 'N', '🙊'],
        [11, 'C'],
      ]);
    });
  });
  it('should parse a subscription marble string into a subscriptionLog', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      expectObservable(source, '---^---!').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('---^---!');
    });
  });
  it('should parse a subscription marble string with an unsubscription', async () => {
    let rejection;
    try {
      await rxTest(({ cold, expectObservable }) => {
        expectObservable(cold('-a'), '---^').toBe('----a');
      });
    } catch (error) {
      rejection = error;
    }
    // A start marker without an end still parses as an infinite subscription.
    // Unlike TestScheduler.run, rxTest then rejects the deliberately open
    // observation so leaked tests cannot silently pass.
    expect(rejection).toBeInstanceOf(Error);
    expect(rejection.message).toMatch(/open observation/);
  });
  it('should parse a subscription marble string with a synchronous unsubscription', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      expectObservable(source, '---(^!)').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('---(^!)');
    });
  });
  it('should ignore whitespace when runMode=true', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      expectObservable(source, '  - -  - -  ^ -   - !  -- -      ').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('----^--!');
    });
  });
  it('should support time progression syntax when runMode=true', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      expectObservable(source, '10.2ms ^ 1.2s - 1m !').toBe('-');
      expectSubscriptions(source.subscriptions).toBe('10.2ms ^ 1.2s - 1m !');
    });
  });
  it('should throw if found more than one subscription point', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('|');
      expect(() => expectObservable(source, '---^-^-!-')).toThrow();
    });
  });
  it('should throw if found more than one unsubscription point', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('|');
      expect(() => expectObservable(source, '---^---!-!')).toThrow();
    });
  });
  it('should parse a simple time marble string to a number', async () => {
    await rxTest(({ time }) => {
      // Accepted TestScheduler compatibility boundary: one millisecond per frame.
      expect(time('-----|')).toBe(5);
    });
  });
  it('should progress time with whitespace', async () => {
    await rxTest(({ time }) => {
      // Accepted TestScheduler compatibility boundary: run-style diagrams ignore whitespace instead of advancing legacy createTime.
      expect(time('     |')).toBe(0);
    });
  });
  it('should progress time with mix of whitespace and dashes', async () => {
    await rxTest(({ time }) => {
      // Accepted TestScheduler compatibility boundary: run-style diagrams ignore whitespace and count only explicit frames.
      expect(time('  --|')).toBe(2);
    });
  });
  it('should throw if not given good marble input', async () => {
    await rxTest(({ time: parseTime }) => {
      expect(() => {
        parseTime('-a-b-#');
      }).toThrow();
    });
  });
  it('should create a cold observable', async () => {
    await rxTest(async ({ cold: createCold, flush: flushMarbles }) => {
      const expected = ['A', 'B'];
      const source = createCold('--a---b--|', { a: 'A', b: 'B' });
      expect(source).toBeInstanceOf(ColdObservable);
      source.subscribe((x) => {
        expect(x).toBe(expected.shift());
      });
      await flushMarbles();
      expect(expected.length).toBe(0);
    });
  });
  it('should create a hot observable', async () => {
    await rxTest(async ({ hot, flush, now }) => {
      const actual = [];
      const source = hot('--a---b--|', { a: 'A', b: 'B' });
      source.subscribe({
        next: (value) => actual.push([now(), value]),
        complete: () => actual.push([now(), 'complete']),
      });
      await flush();
      expect(actual).toEqual([
        [2, 'A'],
        [6, 'B'],
        [9, 'complete'],
      ]);
    });
  });
  it('should exist', async () => {
    // The accepted public testing boundary is rxTest, not a constructible
    // TestScheduler with mutable parser and queue internals.
    expect(rxTest).toBeTypeOf('function');
  });
  it('should exist', async () => {
    await rxTest((context) => {
      expect(context['cold']).toBeTypeOf('function');
    });
  });
  it('should create a cold observable', async () => {
    await rxTest(({ cold: createCold, expectObservable: expectMarbles }) => {
      const expected = [1, 2];
      const source = createCold('-a-b-|', { a: 1, b: 2 });
      source.subscribe({
        next: (x) => {
          expect(x).toBe(expected.shift());
        },
        complete: () => {
          expect(expected.length).toBe(0);
        },
      });
      expectMarbles(source).toBe('-a-b-|', { a: 1, b: 2 });
    });
  });
  it('should exist', async () => {
    await rxTest((context) => {
      expect(context['hot']).toBeTypeOf('function');
    });
  });
  it('should create a hot observable', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const source = hot('---^-a-b-|', { a: 1, b: 2 });
      // A Next hot fixture remains subject-like and multicast, but is deliberately
      // not required to inherit the removed RxJS 7 Subject class.
      expect(source.next).toBeTypeOf('function');
      expect(source.complete).toBeTypeOf('function');
      expectObservable(source).toBe('--a-b-|', { a: 1, b: 2 });
    });
  });
  it('should exist', async () => {
    await rxTest((context) => {
      expect(context['time']).toBeTypeOf('function');
    });
  });
  it('should parse a simple time marble string to a number', async () => {
    await rxTest(({ time }) => {
      // Accepted TestScheduler compatibility boundary: one millisecond per frame.
      expect(time('-----|')).toBe(5);
    });
  });
  it('should exist', async () => {
    await rxTest((context) => {
      expect(context['expectObservable']).toBeTypeOf('function');
    });
  });
  it('should return an object with a toBe function', async () => {
    await rxTest(({ expectObservable: expectMarbles }) => {
      expect(
        ((expectation_1) => {
          expectation_1.toBe('(a|)', { a: 1 });
          return expectation_1;
        })(expectMarbles(ColdObservable.from([1]))).toBe
      ).toBeTypeOf('function');
    });
  });
  it('should append to flushTests array', async () => {
    await rxTest(async ({ cold, expectObservable, flush }) => {
      const expectation = expectObservable(cold('|'));
      expect(expectation.toBe).toBeTypeOf('function');
      expectation.toBe('|');
      await flush();
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ expectObservable: expectMarbles }) => {
      expectMarbles(EMPTY).toBe('|', {});
    });
  });
  it('should handle never', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const never = cold('-');
      expectObservable(never, '^!').toBe('-');
      expectObservable(never, '^--!').toBe('---');
    });
  });
  it('should accept an unsubscription marble diagram', async () => {
    await rxTest(({ hot: createHot, expectObservable: expectMarbles }) => {
      const source = createHot('---^-a-b-|');
      const unsubscribe = '---!';
      const expected = '--a';
      expectMarbles(source, unsubscribe).toBe(expected);
    });
  });
  it('should accept a subscription marble diagram', async () => {
    await rxTest(({ hot: createHot, expectObservable: expectMarbles }) => {
      const source = createHot('-a-b-c|');
      const subscribe = '---^';
      const expected = '---b-c|';
      expectMarbles(source, subscribe).toBe(expected);
    });
  });
  it('should exist', async () => {
    await rxTest((context) => {
      expect(context['expectSubscriptions']).toBeTypeOf('function');
    });
  });
  it('should return an object with a toBe function', async () => {
    await rxTest(({ expectSubscriptions: expectSubscriptionMarbles }) => {
      expect(
        ((expectation_1) => {
          expectation_1.toBe([]);
          return expectation_1;
        })(expectSubscriptionMarbles([])).toBe
      ).toBeTypeOf('function');
    });
  });
  it('should append to flushTests array', async () => {
    await rxTest(async ({ cold, expectObservable, expectSubscriptions, flush }) => {
      const source = cold('|');
      expectObservable(source).toBe('|');
      const expectation = expectSubscriptions(source.subscriptions);
      expect(expectation.toBe).toBeTypeOf('function');
      expectation.toBe('(^!)');
      await flush();
    });
  });
  it('should assert subscriptions of a cold observable', async () => {
    await rxTest(({ cold: createCold, expectSubscriptions: expectSubscriptionMarbles }) => {
      const source = createCold('---a---b-|');
      const subs = '^--------!';
      expectSubscriptionMarbles(source.subscriptions).toBe(subs);
      source.subscribe();
    });
  });
  it('should support empty subscription marbles', async () => {
    await rxTest(({ cold: createCold, expectSubscriptions: expectSubscriptionMarbles }) => {
      const source = createCold('---a---b-|');
      const subs = '----------';
      expectSubscriptionMarbles(source.subscriptions).toBe(subs);
    });
  });
  it('should support empty subscription marbles within arrays', async () => {
    await rxTest(({ cold: createCold, expectSubscriptions: expectSubscriptionMarbles }) => {
      const source = createCold('---a---b-|');
      const subs = ['----------'];
      expectSubscriptionMarbles(source.subscriptions).toBe(subs);
    });
  });
  it('should be awesome', async () => {
    await rxTest(({ cold: createCold, expectObservable: expectMarbles, expectSubscriptions: expectSubscriptionMarbles }) => {
      const values = { a: 1, b: 2 };
      const myObservable = createCold('---a---b--|', values);
      const subs = '^---------!';
      expectMarbles(myObservable).toBe('---a---b--|', values);
      expectSubscriptionMarbles(myObservable.subscriptions).toBe(subs);
    });
  });
  it('should support testing metastreams', async () => {
    await rxTest(({ cold: createCold, hot: createHot, expectObservable: expectMarbles }) => {
      const x = createCold('-a-b|');
      const y = createCold('-c-d|');
      const myObservable = createHot('---x---y----|', { x: x, y: y });
      const expected = '---x---y----|';
      const expectedx = createCold('-a-b|');
      const expectedy = createCold('-c-d|');
      expectMarbles(myObservable).toBe(expected, { x: expectedx, y: expectedy });
    });
  });
  it('should ignore whitespace', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const input = cold('  -a - b -    c |       ');
      const output = input[mergeMap]((value) => ColdObservable.from([value])[delay](10), { concurrent: 1 });
      expectObservable(output).toBe('-- 9ms a 9ms b 9ms (c|)');
      expectSubscriptions(input.subscriptions).toBe('^-----!');
    });
  });
  it('should support time progression syntax', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await rxTest(({ cold, expectObservable }) => {
      const output = cold('10.2ms a 1.2s b 1m c|');
      const expected = '   10.2ms a 1.2s b 1m c|';
      expectObservable(output).toBe(expected);
    });
  });
  it('should provide the correct helpers', async () => {
    await rxTest(({ cold, hot, flush, expectObservable, expectSubscriptions }) => {
      expect(cold).toBeTypeOf('function');
      expect(hot).toBeTypeOf('function');
      expect(flush).toBeTypeOf('function');
      expect(expectObservable).toBeTypeOf('function');
      expect(expectSubscriptions).toBeTypeOf('function');
      const first = cold('-a-c-e|');
      const second = hot('^-b-d-f|');
      expectObservable(first).toBe('-a-c-e|');
      expectObservable(second).toBe('--b-d-f|');
      expectSubscriptions(first.subscriptions).toBe('^-----!');
      expectSubscriptions(second.subscriptions).toBe('^------!');
    });
  });
  it('should have each frame represent a single virtual millisecond', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await rxTest(({ cold, expectObservable }) => {
      const output = cold('-a-b-c--------|')[debounce](5);
      const expected = '   ------ 4ms c---|';
      expectObservable(output).toBe(expected);
    });
  });
  it('should have no maximum frame count', async () => {
    await rxTest(({ cold, expectObservable }) => {
      // rxTest has no legacy maxFrames ceiling.
      expectObservable(cold('-a|')[delay](10000)).toBe('- 10s (a|)');
    });
  });
  it('should make operators that use AsyncScheduler automatically use TestScheduler for actual scheduling', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await rxTest(({ cold, expectObservable }) => {
      const output = cold('-a-b-c--------|')[debounce](5);
      const expected = '   ----------c---|';
      expectObservable(output).toBe(expected);
    });
  });
  it('should flush automatically', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const output = cold('-a-b-c|')[mergeMap]((value) => ColdObservable.from([value])[delay](10), { concurrent: 1 });
      // Returning from the callback performs the automatic flush and assertion.
      expectObservable(output).toBe('-- 9ms a 9ms b 9ms (c|)');
    });
  });
  it('should support explicit flushing', async () => {
    let flushed = false;
    await rxTest(async ({ cold, expectObservable, flush }) => {
      const output = cold('-a-b-c|')[mergeMap]((value) => ColdObservable.from([value])[delay](10), { concurrent: 1 });
      expectObservable(output).toBe('-- 9ms a 9ms b 9ms (c|)');
      await flush();
      flushed = true;
    });
    expect(flushed).toBe(true);
  });
  it('should pass-through return values, e.g. Promises', async () => {
    let completed = false;
    await rxTest(async () => {
      await Promise.resolve('foo');
      completed = true;
    });
    // rxTest owns callback completion and returns Promise<void>; it does not expose
    // arbitrary callback values as the removed TestScheduler.run method did.
    expect(completed).toBe(true);
  });
  it('should restore changes upon thrown errors', async () => {
    let caught;
    try {
      await rxTest(() => {
        throw new Error('kaboom!');
      });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    expect(caught.message).toBe('kaboom!');
    let ran = false;
    await rxTest(async ({ schedule, flush }) => {
      schedule(() => {
        ran = true;
      }, 1);
      await flush();
    });
    expect(ran).toBe(true);
  });
  it('should flush expectations correctly', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await (async () => {
      let rejected_1 = false;
      try {
        await (async () => {
          await rxTest(async ({ cold, expectObservable, flush }) => {
            expectObservable(cold('-x')).toBe('-x');
            expectObservable(cold('-y')).toBe('-y');
            const expectation = expectObservable(cold('-z'));
            await flush();
            expectation.toBe('-q');
          });
        })();
      } catch {
        rejected_1 = true;
      }
      expect(rejected_1).toBe(true);
    })();
  });
  it('should throw if animate() is not called when needed', async () => {
    let rejection;
    try {
      await rxTest(() => {
        globalThis.requestAnimationFrame(() => {});
      });
    } catch (error) {
      rejection = error;
    }
    expect(rejection).toBeInstanceOf(Error);
    expect(rejection.message).toMatch(/animation-frame callback/);
  });
  it('should throw if animate() is called more than once', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await (async () => {
      let rejected_1 = false;
      try {
        await await rxTest(({ animate }) => {
          animate('--x');
          animate('--x');
        });
      } catch {
        rejected_1 = true;
      }
      expect(rejected_1).toBe(true);
    })();
  });
  it('should throw if animate() completes', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await (async () => {
      let rejected_1 = false;
      try {
        await await rxTest(({ animate }) => {
          animate('--|');
        });
      } catch {
        rejected_1 = true;
      }
      expect(rejected_1).toBe(true);
    })();
  });
  it('should throw if animate() errors', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await (async () => {
      let rejected_1 = false;
      try {
        await await rxTest(({ animate }) => {
          animate('--#');
        });
      } catch {
        rejected_1 = true;
      }
      expect(rejected_1).toBe(true);
    })();
  });
  it('should schedule async requests within animate()', async () => {
    await rxTest(async ({ animate, schedule, flush }) => {
      animate([2]);
      const values = [];
      schedule(() => globalThis.requestAnimationFrame((timestamp) => values.push('a@' + timestamp)), 0);
      schedule(() => globalThis.requestAnimationFrame((timestamp) => values.push('b@' + timestamp)), 1);
      await flush();
      expect(values).toEqual(['a@2', 'b@2']);
    });
  });
  it('should schedule sync requests within animate()', async () => {
    await rxTest(async ({ animate, schedule, flush }) => {
      animate([2]);
      const values = [];
      schedule(() => {
        const first = globalThis.requestAnimationFrame((timestamp) => values.push('a@' + timestamp));
        globalThis.requestAnimationFrame((timestamp) => values.push('b@' + timestamp));
      }, 1);
      await flush();
      expect(values).toEqual(['a@2', 'b@2']);
    });
  });
  it('should support request cancellation within animate()', async () => {
    await rxTest(async ({ animate, schedule, flush }) => {
      animate([2]);
      const values = [];
      schedule(() => {
        const first = globalThis.requestAnimationFrame((timestamp) => values.push('a@' + timestamp));
        globalThis.requestAnimationFrame((timestamp) => values.push('b@' + timestamp));
        globalThis.cancelAnimationFrame(first);
      }, 1);
      await flush();
      expect(values).toEqual(['b@2']);
    });
  });
  it('should schedule immediates', async () => {
    if (typeof globalThis.setImmediate !== 'function') {
      return;
    }
    await rxTest(async ({ flush, now }) => {
      const values = [];
      const handle = globalThis.setImmediate(() => values.push('a@' + now()));
      expect(values).toEqual([]);
      await flush();
      expect(values).toEqual(['a@0']);
    });
  });
  it('should support clearing immediates', async () => {
    if (typeof globalThis.setImmediate !== 'function') {
      return;
    }
    await rxTest(async ({ flush, now }) => {
      const values = [];
      const handle = globalThis.setImmediate(() => values.push('a@' + now()));
      globalThis.clearImmediate(handle);
      expect(values).toEqual([]);
      await flush();
      expect(values).toEqual([]);
    });
  });
  it('should schedule intervals', async () => {
    await rxTest(async ({ flush, now }) => {
      const values = [];
      const handle = globalThis.setInterval(() => {
        if (true) {
          values.push('a@' + now());
        }
        if (true) {
          globalThis.clearInterval(handle);
        }
      }, 1);
      expect(values).toEqual([]);
      await flush();
      expect(values).toEqual(['a@1']);
    });
  });
  it('should reschedule intervals until cleared', async () => {
    await rxTest(async ({ flush, now }) => {
      const values = [];
      const handle = globalThis.setInterval(() => {
        if (now() <= 3) {
          values.push('a@' + now());
        }
        if (now() > 3) {
          globalThis.clearInterval(handle);
        }
      }, 1);
      expect(values).toEqual([]);
      await flush();
      expect(values).toEqual(['a@1', 'a@2', 'a@3']);
    });
  });
  it('should schedule timeouts', async () => {
    await rxTest(async ({ flush, now }) => {
      const values = [];
      globalThis.setTimeout(() => values.push('a@' + now()), 1);
      expect(values).toEqual([]);
      await flush();
      expect(values).toEqual(['a@1']);
    });
  });
  it('should schedule immediates before intervals and timeouts', async () => {
    if (typeof globalThis.setImmediate !== 'function') {
      return;
    }
    await rxTest(async ({ flush, now }) => {
      const values = [];
      const interval = globalThis.setInterval(() => {
        values.push('a@' + now());
        globalThis.clearInterval(interval);
      }, 0);
      globalThis.setTimeout(() => values.push('b@' + now()), 0);
      globalThis.setImmediate(() => values.push('c@' + now()));
      await flush();
      expect(values).toEqual(['c@0', 'a@0', 'b@0']);
    });
  });
  it('should support animationFrame, async and asap schedulers', async () => {
    await rxTest(async ({ animate, cold, flush, now }) => {
      animate([9]);
      const values = [];
      cold('--m|').subscribe({
        next: () => {
          requestAnimationFrame(() => values.push('a@' + now()));
          setTimeout(() => values.push('b@' + now()), 5);
          setTimeout(() => values.push('c@' + now()), 0);
          queueMicrotask(() => values.push('d@' + now()));
        },
      });
      await flush();
      expect(values).toEqual(['d@2', 'c@2', 'b@7', 'a@9']);
    });
  });
  it('should emit asap notifications before async notifications', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const values = [];
      cold('--ab|').subscribe({
        next: (value) => {
          if (value === 'a') {
            setTimeout(() => values.push('a@' + now()), 1);
          } else {
            queueMicrotask(() => values.push('b@' + now()));
          }
        },
      });
      await flush();
      expect(values).toEqual(['b@3', 'a@3']);
    });
  });
  it('should support intervals with zero duration', async () => {
    await rxTest(async ({ cold, flush, now }) => {
      const values = [];
      cold('--m|').subscribe({
        next: () => {
          let microtasks = 0;
          const runMicrotask = () => {
            values.push('b@' + now());
            if (++microtasks < 3) queueMicrotask(runMicrotask);
          };
          queueMicrotask(runMicrotask);
          let intervals = 0;
          const handle = setInterval(() => {
            values.push('a@' + now());
            if (++intervals === 3) clearInterval(handle);
          }, 0);
        },
      });
      await flush();
      expect(values).toEqual(['b@2', 'b@2', 'b@2', 'a@2', 'a@2', 'a@2']);
    });
  });
  it('should parse a simple time marble string to a number', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await rxTest(({ time }) => {
      const t = time('--|');
      expect(t).toBe(2);
    });
  });
  it('should ignore whitespace', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await rxTest(({ time }) => {
      const t = time('  --|');
      expect(t).toBe(2);
    });
  });
  it('should throw if not given good marble input', async () => {
    const assertDeepEquals = (actual, expected) => {
      expect(actual).toEqual(expected);
    };
    await rxTest(({ time }) => {
      expect(() => {
        time('-a-b-#');
      }).toThrow();
    });
  });
});
