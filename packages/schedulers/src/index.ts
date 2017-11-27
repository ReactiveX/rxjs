import { asap } from '@reactivex/rxjs/src/scheduler/asap';
import { async } from '@reactivex/rxjs/src/scheduler/async';
import { queue } from '@reactivex/rxjs/src/scheduler/queue';
import { animationFrame } from '@reactivex/rxjs/src/scheduler/animationFrame';
export { AsapScheduler } from '@reactivex/rxjs/src/scheduler/AsapScheduler';
export { AsyncScheduler } from '@reactivex/rxjs/src/scheduler/AsyncScheduler';
export { QueueScheduler } from '@reactivex/rxjs/src/scheduler/QueueScheduler';
export { AnimationFrameScheduler } from '@reactivex/rxjs/src/scheduler/AnimationFrameScheduler';

/* tslint:enable:no-unused-variable */

/**
 * @typedef {Object} Rx.Scheduler
 * @property {Scheduler} queue Schedules on a queue in the current event frame
 * (trampoline scheduler). Use this for iteration operations.
 * @property {Scheduler} asap Schedules on the micro task queue, which uses the
 * fastest transport mechanism available, either Node.js' `process.nextTick()`
 * or Web Worker MessageChannel or setTimeout or others. Use this for
 * asynchronous conversions.
 * @property {Scheduler} async Schedules work with `setInterval`. Use this for
 * time-based operations.
 * @property {Scheduler} animationFrame Schedules work with `requestAnimationFrame`.
 * Use this for synchronizing with the platform's painting
 */
export const Scheduler = {
  asap,
  queue,
  animationFrame,
  async
};