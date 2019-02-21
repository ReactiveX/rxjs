import { AnimationFrameAction } from './AnimationFrameAction';
import { AnimationFrameScheduler } from './AnimationFrameScheduler';

/**
 *
 * Animation Frame Scheduler
 *
 * <span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>
 *
 * When `animationFrame` scheduler is used with delay, it will fall back to {@link asyncScheduler} scheduler
 * behaviour.
 *
 * Without delay, `animationFrame` scheduler can be used to create smooth browser animations.
 * It makes sure scheduled task will happen just before next browser content repaint,
 * thus performing animations as efficiently as possible.
 *
 * ## Example
 * Schedule div height animation
 * ```ts
 * // html: <div style="background: #0ff;"></div>
 * import { animationFrameScheduler } from 'rxjs';
 *
 * const div = document.querySelector('div');
 *
 * function animate({ height, div }) {
 *  animationFrameScheduler.schedule(animate, 0, { height, div });
 * }
 *
 * animationFrameScheduler.schedule(animate, 0, { height: 0, div });
 *
 * // You will see a div element growing in height
 * ```
 *
 * @static true
 * @name animationFrame
 * @owner Scheduler
 */

export const animationFrame = new AnimationFrameScheduler(AnimationFrameAction);
