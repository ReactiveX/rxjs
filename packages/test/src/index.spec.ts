import { describe, expect, it } from 'vitest';
import { ColdObservable } from 'rxjs/cold-observable';
import { create } from 'rxjs/create';
import { RxTestAssertionError, rxTest } from './index.js';
import { getObservableConstructor } from './platform-observable.js';

describe('rxTest', () => {
  it('creates cold observables and supports numeric marble durations', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions, time }) => {
      const source = cold('12ms a 20ms (b|)', {
        a: 'first',
        b: 'second',
      });

      expectObservable(source).toBe('12ms a 20ms (b|)', {
        a: 'first',
        b: 'second',
      });
      expectSubscriptions(source.subscriptions).toBe('^ 32ms !');
      expect(time('12ms ---|')).toBe(15);
    });
  });

  it('matches exact timestamped observable messages', async () => {
    await rxTest(({ cold, expectObservable }) => {
      expectObservable(cold('-(aaa)#')).toBe([
        { frame: 1, notification: { kind: 'N', value: 'a' } },
        { frame: 1, notification: { kind: 'N', value: 'a' } },
        { frame: 1, notification: { kind: 'N', value: 'a' } },
        { frame: 6, notification: { kind: 'E', error: 'error' } },
      ]);
    });
  });

  it('uses independent timelines for cold test observables', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b--|');

      expectObservable(source).toBe('--a--b--|');
      expectObservable(source, '---^').toBe('-----a--b--|');
      expectSubscriptions(source.subscriptions).toBe(['^-------!', '---^-------!']);
    });
  });

  it('constructs cold operator results as ordinary ColdObservables', async () => {
    await rxTest(({ cold }) => {
      const source = cold('a|');
      const result = source[create](() => {});

      expect(source).toBeInstanceOf(ColdObservable);
      expect(result.constructor).toBe(ColdObservable);
    });
  });

  it('shares one active producer for platform test observables', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--b--|');

      expectObservable(source).toBe('--a--b--|');
      expectObservable(source, '---^').toBe('-----b--|');
      expectSubscriptions(source.subscriptions).toBe('^-------!');
    });
  });

  it('creates a subject-like hot observable on an absolute timeline', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('-a--b--|');

      expectObservable(source).toBe('-a--b--|');
      expectObservable(source, '---^').toBe('----b--|');
      expectSubscriptions(source.subscriptions).toBe(['^------!', '---^---!']);
    });
  });

  it('constructs hot operator results as ordinary platform Observables', async () => {
    await rxTest(({ hot }) => {
      const ObservableConstructor = getObservableConstructor();
      const source = hot('a|');
      const result = source[create](() => {});

      expect(source.constructor).not.toBe(ObservableConstructor);
      expect(result.constructor).toBe(ObservableConstructor);
    });
  });

  it('attaches a time-zero observation before a hot time-zero notification', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('a-b-|');

      expectObservable(source).toBe('a-b-|');
      expectSubscriptions(source.subscriptions).toBe('^---!');
    });
  });

  it('virtualizes native timers and clocks', async () => {
    await rxTest(
      ({ expectObservable, now }) => {
        const ObservableConstructor = getObservableConstructor();
        const source = new ObservableConstructor<string>((subscriber) => {
          const handle = setTimeout(
            (value: string) => {
              expect(now()).toBe(12);
              expect(Date.now()).toBe(1_012);
              expect(performance.now()).toBe(12);
              subscriber.next(value);
              subscriber.complete();
            },
            12,
            'ready'
          );
          subscriber.addTeardown(() => clearTimeout(handle));
        });

        expectObservable(source).toBe('12ms (a|)', {
          a: 'ready',
        });
      },
      { startTime: 1_000 }
    );
  });

  it('allows the callback to await virtual timers', async () => {
    await rxTest(async ({ now }) => {
      let completed = false;
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          completed = true;
          resolve();
        }, 25);
      });

      expect(completed).toBe(true);
      expect(now()).toBe(25);
    });
  });

  it('supports direct scheduling and async time advancement', async () => {
    await rxTest(async ({ schedule, advanceBy, now }) => {
      const values: number[] = [];
      schedule(() => {
        values.push(1);
      }, '5ms');
      schedule(() => {
        values.push(2);
      }, '10ms');

      await advanceBy('5ms');
      expect(values).toEqual([1]);
      expect(now()).toBe(5);

      await advanceBy('5ms');
      expect(values).toEqual([1, 2]);
      expect(now()).toBe(10);
    });
  });

  it('coordinates animation and idle opportunities', async () => {
    await rxTest(async ({ animate, idle, flush, now }) => {
      animate('----@----@');
      idle([6, 12], { budget: 5 });

      const events: string[] = [];
      requestAnimationFrame(() => {
        events.push(`paint:${now()}`);
      });
      setTimeout(() => {
        requestAnimationFrame(() => {
          events.push(`paint:${now()}`);
        });
      }, 5);
      requestIdleCallback((deadline) => {
        events.push(`idle:${now()}:${deadline.didTimeout}:${deadline.timeRemaining()}`);
      });

      await flush();
      expect(events).toEqual(['paint:4', 'idle:6:false:5', 'paint:9']);
    });
  });

  it('runs idle callbacks at their virtual timeout', async () => {
    await rxTest(async ({ idle, flush, now }) => {
      idle([20]);
      const values: unknown[] = [];
      requestIdleCallback(
        (deadline) => {
          values.push(now(), deadline.didTimeout, deadline.timeRemaining());
        },
        { timeout: 7 }
      );

      await flush();
      expect(values).toEqual([7, true, 0]);
    });
  });

  it('virtualizes AbortSignal.timeout', async () => {
    await rxTest(async ({ advanceTo }) => {
      const signal = AbortSignal.timeout(9);
      expect(signal.aborted).toBe(false);

      await advanceTo(9);
      expect(signal.aborted).toBe(true);
      expect(signal.reason).toBeInstanceOf(DOMException);
      expect(signal.reason.name).toBe('TimeoutError');
    });
  });

  it('supports toEqual comparisons', async () => {
    await rxTest(({ cold, expectObservable }) => {
      expectObservable(cold('--a--|')).toEqual(cold('--a--|'));
    });
  });

  it('observes from frame zero when only unsubscription is marked', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b--|');

      expectObservable(source, '----!').toBe('--a-');
      expectSubscriptions(source.subscriptions).toBe('^---!');
    });
  });

  it('treats the unsubscription frame as an exclusive observation boundary', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const coldSource = cold('--a--b--c--');
      const hotSource = hot('--a--b--c--');

      expectObservable(coldSource, '--------!').toBe('--a--b--');
      expectObservable(hotSource, '--------!').toBe('--a--b--');
      expectSubscriptions(coldSource.subscriptions).toBe('^-------!');
      expectSubscriptions(hotSource.subscriptions).toBe('^-------!');
    });
  });

  it('aborts an observation before a hot notification at the same frame', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('a-b-|');

      expectObservable(source, '--!').toBe('a-');
      expectSubscriptions(source.subscriptions).toBe('^-!');
    });
  });

  it('supports grouped values, errors, and observable metastreams', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const failure = new Error('expected failure');
      expectObservable(cold('-(ab)-#', { a: 1, b: 2 }, failure)).toBe('-(ab)-#', { a: 1, b: 2 }, failure);

      const inner = cold('-x|');
      expectObservable(cold('a|', { a: inner })).toBe('a|', {
        a: inner,
      });
    });
  });

  it('restarts a platform source after the final observer leaves', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const source = observable('--a--|');

      expectObservable(source, '^--!').toBe('--a');
      expectObservable(source, '-----^').toBe('-------a--|');
      expectSubscriptions(source.subscriptions).toBe(['^--!', '-----^----!']);
    });
  });

  it('supports negative hot time with a caret zero point', async () => {
    await rxTest(({ hot, expectObservable }) => {
      expectObservable(hot('a-^-b|')).toBe('--b|');
    });
  });

  it('runs microtasks between same-time timer callbacks', async () => {
    await rxTest(async ({ flush }) => {
      const events: string[] = [];
      setTimeout(() => {
        events.push('timer:1');
        queueMicrotask(() => events.push('microtask'));
      }, 0);
      setTimeout(() => events.push('timer:2'), 0);

      await flush();
      expect(events).toEqual(['timer:1', 'microtask', 'timer:2']);
    });
  });

  it('supports cancellation for direct scheduled work', async () => {
    await rxTest(async ({ schedule, flush }) => {
      let called = false;
      const task = schedule(() => {
        called = true;
      }, 10);
      task.cancel('not needed');

      await flush();
      expect(called).toBe(false);
      expect(task.signal.aborted).toBe(true);
      expect(task.signal.reason).toBe('not needed');
    });
  });

  it('supports Node timer-handle methods and refresh', async () => {
    await rxTest(async ({ advanceBy }) => {
      let calls = 0;
      const handle = setTimeout(() => {
        calls++;
      }, 10);
      const nodeHandle = handle as unknown as {
        hasRef(): boolean;
        refresh(): unknown;
        unref(): unknown;
      };

      expect(nodeHandle.hasRef()).toBe(true);
      nodeHandle.unref();
      expect(nodeHandle.hasRef()).toBe(false);

      await advanceBy(5);
      nodeHandle.refresh();
      await advanceBy(5);
      expect(calls).toBe(0);
      await advanceBy(5);
      expect(calls).toBe(1);
    });
  });

  it('supports interval arguments, cancellation, and cross-kind timer clearing', async () => {
    await rxTest(async ({ advanceTo }) => {
      const events: string[] = [];
      const intervalHandle = setInterval(
        (value: string) => {
          events.push(value);
          if (events.length === 3) {
            clearTimeout(intervalHandle);
          }
        },
        2,
        'interval'
      );

      const timeoutHandle = setTimeout(() => events.push('timeout'), 4);
      clearInterval(timeoutHandle);

      await advanceTo(10);
      expect(events).toEqual(['interval', 'interval', 'interval']);
    });
  });

  it('prioritizes setImmediate ahead of zero-duration timers', async () => {
    if (typeof (globalThis as { setImmediate?: unknown }).setImmediate !== 'function') {
      return;
    }

    await rxTest(async ({ flush }) => {
      const events: string[] = [];
      setTimeout(() => events.push('timeout'), 0);
      (
        globalThis as {
          setImmediate(callback: () => void): unknown;
        }
      ).setImmediate(() => events.push('immediate'));

      await flush();
      expect(events).toEqual(['immediate', 'timeout']);
    });
  });

  it('supports cancelling animation and idle callbacks', async () => {
    await rxTest(async ({ animate, idle, flush }) => {
      animate([5]);
      idle([6]);
      const events: string[] = [];

      const animationHandle = requestAnimationFrame(() => events.push('animation'));
      const idleHandle = requestIdleCallback(() => events.push('idle'));
      cancelAnimationFrame(animationHandle);
      cancelIdleCallback(idleHandle);

      await flush();
      expect(events).toEqual([]);
    });
  });

  it('turns reportError and queued microtask failures into test failures', async () => {
    const error = new Error('unhandled test error');
    await expect(
      rxTest(() => {
        queueMicrotask(() => {
          globalThis.reportError(error);
        });
      })
    ).rejects.toBe(error);
  });

  it('turns unhandled cold source errors into test failures', async () => {
    const error = new Error('unhandled cold source error');

    await expect(
      rxTest(({ cold }) => {
        cold('#', undefined, error).subscribe();
      })
    ).rejects.toBe(error);
  });

  it('supports custom assertion adapters', async () => {
    let calls = 0;
    await rxTest(
      ({ cold, expectObservable }) => {
        expectObservable(cold('--a|')).toBe('--a|');
      },
      {
        assertDeepEqual(actual, expected, info) {
          calls++;
          expect(info.kind).toBe('observable');
          expect(actual).toEqual(expected);
        },
      }
    );
    expect(calls).toBe(1);
  });

  it('uses a useful default assertion error', async () => {
    await expect(
      rxTest(({ cold, expectObservable }) => {
        expectObservable(cold('--a|')).toBe('--b|');
      })
    ).rejects.toBeInstanceOf(RxTestAssertionError);
  });

  it('restores every patched descriptor after success and failure', async () => {
    const properties: Array<readonly [object, PropertyKey]> = [
      [globalThis, 'setTimeout'],
      [globalThis, 'clearTimeout'],
      [globalThis, 'setInterval'],
      [globalThis, 'clearInterval'],
      [globalThis, 'requestAnimationFrame'],
      [globalThis, 'cancelAnimationFrame'],
      [globalThis, 'requestIdleCallback'],
      [globalThis, 'cancelIdleCallback'],
      [globalThis, 'setImmediate'],
      [globalThis, 'clearImmediate'],
      [globalThis, 'Date'],
      [globalThis, 'queueMicrotask'],
      [globalThis, 'reportError'],
      [AbortSignal, 'timeout'],
    ];
    if (globalThis.performance) {
      properties.push([globalThis.performance, 'now']);
    }
    const originals = properties.map(([target, key]) => Object.getOwnPropertyDescriptor(target, key));
    const assertRestored = (): void => {
      properties.forEach(([target, key], index) => {
        expect(Object.getOwnPropertyDescriptor(target, key)).toEqual(originals[index]);
      });
    };

    let successSignal: AbortSignal | undefined;
    await rxTest(({ signal }) => {
      successSignal = signal;
    });
    expect(successSignal?.aborted).toBe(true);
    assertRestored();

    let failureSignal: AbortSignal | undefined;
    await expect(
      rxTest(({ signal }) => {
        failureSignal = signal;
        throw new Error('callback failed');
      })
    ).rejects.toThrow('callback failed');
    expect(failureSignal?.aborted).toBe(true);
    assertRestored();
  });

  it('rejects cleanup errors after restoring the realm', async () => {
    const originalSetTimeout = globalThis.setTimeout;
    const cleanupError = new Error('cleanup failed');
    const ObservableConstructor = getObservableConstructor();

    await expect(
      rxTest(({ signal }) => {
        new ObservableConstructor((subscriber) => {
          subscriber.addTeardown(() => {
            throw cleanupError;
          });
        }).subscribe(null, { signal });
      })
    ).rejects.toBe(cleanupError);

    expect(globalThis.setTimeout).toBe(originalSetTimeout);
  });

  it('serializes overlapping tests in the same realm', async () => {
    const order: string[] = [];
    const first = rxTest(async () => {
      order.push('first:start');
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 5);
      });
      order.push('first:end');
    });
    const second = rxTest(() => {
      order.push('second');
    });

    await Promise.all([first, second]);
    expect(order).toEqual(['first:start', 'first:end', 'second']);
  });

  it('rejects nested tests', async () => {
    await rxTest(async () => {
      await expect(rxTest(() => {})).rejects.toThrow('Nested rxTest calls are not supported');
    });
  });

  it('fails uncancelled periodic work instead of hanging', async () => {
    await expect(
      rxTest(
        () => {
          setInterval(() => {}, 0);
        },
        { maxTaskExecutions: 5 }
      )
    ).rejects.toThrow('maxTaskExecutions');
  });

  it('fails animation work without a future opportunity', async () => {
    await expect(
      rxTest(() => {
        requestAnimationFrame(() => {});
      })
    ).rejects.toThrow('animation-frame callback');
  });

  it('enforces maxVirtualTime', async () => {
    await expect(
      rxTest(
        () => {
          setTimeout(() => {}, 11);
        },
        { maxVirtualTime: 10 }
      )
    ).rejects.toThrow('maxVirtualTime');
  });

  it('rejects an expectation without a matcher', async () => {
    await expect(
      rxTest(({ cold, expectObservable }) => {
        expectObservable(cold('|'));
      })
    ).rejects.toThrow('without a matcher');
  });

  it('rejects an open observation without an unsubscription marble', async () => {
    await expect(
      rxTest(({ cold, expectObservable }) => {
        expectObservable(cold('--a')).toBe('--a');
      })
    ).rejects.toThrow('open observation');
  });

  it('preserves an undefined callback rejection', async () => {
    const result = rxTest(() => Promise.reject());
    await expect(result).rejects.toBeUndefined();
  });
});
