import { beforeAll, describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { rxTest } from '../../test/src/index.js';

type AnimationFramesSymbol = typeof import('./animation-frames.js').animationFrames;
type DelaySymbol = typeof import('./delay.js').delay;
type IntervalSymbol = typeof import('./interval.js').interval;
type TakeSymbol = typeof import('./take.js').take;

let animationFrames: AnimationFramesSymbol;
let delay: DelaySymbol;
let interval: IntervalSymbol;
let take: TakeSymbol;

beforeAll(async () => {
  ({ animationFrames } = await import('./animation-frames.js'));
  ({ delay } = await import('./delay.js'));
  ({ interval } = await import('./interval.js'));
  ({ take } = await import('./take.js'));
});

describe('host scheduling through rxTest', () => {
  it('shares one virtual host timeline with application scheduling', async () => {
    await rxTest(async ({ animate, idle, flush, now }) => {
      animate([4, 8]);
      idle([6]);
      const events: string[] = [];

      globalThis.setTimeout(() => events.push(`app-timeout@${now()}`), 3);
      globalThis.requestAnimationFrame((timestamp) => events.push(`app-frame@${timestamp}`));
      globalThis.requestIdleCallback(() => events.push(`app-idle@${now()}`));

      Observable[interval](2)
        [take](2)
        .subscribe((value) => events.push(`rxjs-interval:${value}@${now()}`));
      Observable.from(['value'])
        [delay](5)
        .subscribe(() => events.push(`rxjs-delay@${now()}`));
      Observable[animationFrames]()
        [take](2)
        .subscribe(({ timestamp }) => events.push(`rxjs-frame@${timestamp}`));

      await flush();

      expect(events).toEqual([
        'rxjs-interval:0@2',
        'app-timeout@3',
        'rxjs-interval:1@4',
        'app-frame@4',
        'rxjs-frame@4',
        'rxjs-delay@5',
        'app-idle@6',
        'rxjs-frame@8',
      ]);
    });
  });

  it('cancels a pending host animation frame through the patched global', async () => {
    await rxTest(async ({ animate, flush }) => {
      animate([4]);
      const controller = new AbortController();
      const timestamps: number[] = [];

      Observable[animationFrames]().subscribe(({ timestamp }) => timestamps.push(timestamp), {
        signal: controller.signal,
      });
      globalThis.setTimeout(() => controller.abort(), 5);

      await flush();
      expect(timestamps).toEqual([4]);
    });
  });
});
