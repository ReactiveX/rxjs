import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type AnimationFramesSymbol = typeof import('./animation-frames.js').animationFrames;
type TakeSymbol = typeof import('./take.js').take;

let animationFrames: AnimationFramesSymbol;
let take: TakeSymbol;

beforeAll(async () => {
  ({ animationFrames } = await import('./animation-frames.js'));
  ({ take } = await import('./take.js'));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('animationFrames', () => {
  it('installs an exact static Symbol with the RxJS 7 frame shape', () => {
    stubAnimationFrames();
    const result = Observable[animationFrames]();
    const otherKey = Symbol('animationFrames');

    expectTypeOf(result).toEqualTypeOf<Observable<{ timestamp: number; elapsed: number }>>();
    expect('animationFrames' in Observable).toBe(false);
    expect(Symbol.keyFor(animationFrames)).toBeUndefined();
    expect((Observable as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });

  it('uses a custom provider for both timestamp and elapsed', () => {
    const frames = stubAnimationFrames();
    const times = [50, 100, 200, 300];
    const values: Array<{ timestamp: number; elapsed: number }> = [];

    Observable[animationFrames]({ now: () => times.shift()! }).subscribe((value) => values.push(value));
    frames.fire(1);
    frames.fire(2);
    frames.fire(3);

    expect(values).toEqual([
      { timestamp: 100, elapsed: 50 },
      { timestamp: 200, elapsed: 150 },
      { timestamp: 300, elapsed: 250 },
    ]);
  });

  it('does not request another frame after downstream completes in a callback', () => {
    const frames = stubAnimationFrames();
    const values: number[] = [];

    Observable[animationFrames]({ now: () => 0 })
      [take](2)
      .subscribe((value) => values.push(value.timestamp));
    frames.fire(10);
    frames.fire(20);

    expect(values).toEqual([0, 0]);
    expect(frames.requestCount()).toBe(2);
    expect(frames.cancelCount()).toBe(0);
  });
});

function stubAnimationFrames(): {
  fire(timestamp: number): void;
  requestCount(): number;
  cancelCount(): number;
} {
  let nextId = 1;
  let requestCount = 0;
  let cancelCount = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = nextId++;
    requestCount++;
    callbacks.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    cancelCount++;
    callbacks.delete(id);
  });
  return {
    fire(timestamp) {
      const entry = callbacks.entries().next().value as [number, FrameRequestCallback] | undefined;
      if (!entry) {
        throw new Error('No animation frame was requested.');
      }
      callbacks.delete(entry[0]);
      entry[1](timestamp);
    },
    requestCount: () => requestCount,
    cancelCount: () => cancelCount,
  };
}
