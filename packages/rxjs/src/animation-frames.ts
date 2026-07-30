import { create } from './create.js';

export const animationFrames: unique symbol = Symbol('animationFrames');

export interface AnimationFrameTimestampProvider {
  now(): number;
}

declare global {
  interface AnimationFrameInfo {
    timestamp: number;
    elapsed: number;
  }

  interface ObservableCtor {
    [animationFrames]: (timestampProvider?: AnimationFrameTimestampProvider) => Observable<AnimationFrameInfo>;
  }
}

Observable[animationFrames] = animationFramesImpl;

function animationFramesImpl(this: ObservableCtor, timestampProvider?: AnimationFrameTimestampProvider): Observable<AnimationFrameInfo> {
  return this[create]((subscriber) => {
    const now = timestampProvider ? () => timestampProvider.now() : () => globalThis.performance.now();
    let start: number;
    try {
      start = now();
    } catch (error) {
      subscriber.error(error);
      return;
    }

    let id: number | undefined;
    const run = () => {
      id = globalThis.requestAnimationFrame((frameTimestamp) => {
        id = undefined;
        let currentTimestamp: number;
        try {
          currentTimestamp = now();
        } catch (error) {
          subscriber.error(error);
          return;
        }
        subscriber.next({
          timestamp: timestampProvider ? currentTimestamp : frameTimestamp,
          elapsed: currentTimestamp - start,
        });
        if (subscriber.active) {
          run();
        }
      });
    };

    subscriber.addTeardown(() => {
      if (id !== undefined) {
        globalThis.cancelAnimationFrame(id);
      }
    });

    run();
  });
}
