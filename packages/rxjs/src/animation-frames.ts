// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const animationFrames: unique symbol = Symbol('animationFrames');

declare global {
  interface AnimationFrameInfo {
    start: number;
    timestamp: number;
    precisionTimestamp: number;
    elapsed: number;
    frame: number;
    timeDiff: number;
  }

  interface ObservableCtor {
    [animationFrames]: () => Observable<AnimationFrameInfo>;
  }
}

Observable[animationFrames] = animationFramesImpl;

function animationFramesImpl(
  this: ObservableCtor
): Observable<AnimationFrameInfo> {
  return this[create]((subscriber) => {
    let id = 0;
    const start = Date.now();
    let lastTimestamp = start;
    let frame = 0;
    const run = () => {
      id = requestAnimationFrame((precisionTimestamp) => {
        const timestamp = Date.now();
        const timeDiff = lastTimestamp - timestamp;
        lastTimestamp = timestamp;
        frame++;

        subscriber.next({
          start,
          timestamp,
          precisionTimestamp,
          elapsed: timestamp - start,
          frame,
          timeDiff,
        });

        run();
      });
    };

    subscriber.addTeardown(() => cancelAnimationFrame(id));

    run();
  });
}
