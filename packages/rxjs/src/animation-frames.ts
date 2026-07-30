import { create } from './create.js';

export const animationFrames: unique symbol = Symbol('animationFrames');

export interface AnimationFrameTimestampProvider {
  now(): number;
}

export const animationFrameProvider = {
  delegate: {
    requestAnimationFrame: (callback: FrameRequestCallback): number => requestAnimationFrame(callback),
    cancelAnimationFrame: (id: number): void => cancelAnimationFrame(id),
  },
};

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

const performanceTimestampProvider: AnimationFrameTimestampProvider = {
  now: () => performance.now(),
};

function animationFramesImpl(
  this: ObservableCtor,
  timestampProvider?: AnimationFrameTimestampProvider
): Observable<AnimationFrameInfo> {
  return this[create]((subscriber) => {
    const provider = timestampProvider ?? performanceTimestampProvider;
    let start: number;
    try {
      start = provider.now();
    } catch (error) {
      subscriber.error(error);
      return;
    }

    let id: number | undefined;
    const run = () => {
      id = animationFrameProvider.delegate.requestAnimationFrame((frameTimestamp) => {
        id = undefined;
        let currentTimestamp: number;
        try {
          currentTimestamp = provider.now();
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
        animationFrameProvider.delegate.cancelAnimationFrame(id);
      }
    });

    run();
  });
}
