import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';

// TODO: move to types.ts
export interface TimestampProvider {
  now(): number;
}

/**
 * A list of subscribers to notify, the timestamp providers used to get values, and the start times
 * from their subscriptions.
 *
 * The structure is as follows:
 *
 * `i`: `Subscriber<number>` - The subscriber to notify.
 * `i + 1`: `timestampProvider` - the object used to get each new timestamp
 * `i + 2`: `number` - the start timestamp
 */
const subscriberState: (Subscriber<number> | TimestampProvider | number)[] = [];

/**
 * A list of subscribers to remove at the end of the run loop.
 *
 * This exists because during the run loop, when `next` is called on each subscriber,
 * a side effect could occur that would cause unsubscription. In order to prevent us
 * from looping over a currently mutating array of subscribers, we buffer the subscribers
 * we want to remove until after the run loop is done, then remove them.
 */
const subscribersToRemoveAfterRun: Subscriber<number>[] = [];

/**
 * An observable of animation frames
 *
 * Emits the the amount of time elapsed since subscription on each animation frame. Defaults to elapsed
 * milliseconds. Does not end on its own.
 *
 * Will schedule a shared animation frame loop and notify all subscribers from that one loop. As
 * an implementation detail, this means that it does not necessary call `requestAnimationFrame` at
 * the time of subscription, rather it shares a single `requestAnimationFrame` loop between many
 * subscriptions.
 *
 * This is useful for setting up animations with RxJS.
 *
 * ### Example
 *
 * Tweening a div to move it on the screen
 *
 * ```ts
 * import { animationFrames } from 'rxjs';
 * import { map, takeWhile, endWith } from 'rxjs/operators';
 *
 * function tween(start: number, end: number, duration: number) {
 *   const diff = end - start;
 *   return animationFrames().pipe(
 *     // Figure out what percentage of time has passed
 *     map(elapsed => elapsed / duration),
 *     // Take the vector while less than 100%
 *     takeWhile(v => v < 1),
 *     // Finish with 100%
 *     endWith(1),
 *     // Calculate the distance traveled between start and end
 *     map(v => v * diff + start)
 *   );
 * }
 *
 * // Setup a div for us to move around
 * const div = document.createElement('div');
 * document.body.appendChild(div);
 * div.style.position = 'absolute';
 * div.style.width = '40px';
 * div.style.height = '40px';
 * div.style.backgroundColor = 'lime';
 * div.style.transform = 'translate3d(10px, 0, 0)';
 *
 * tween(10, 200, 4000).subscribe(x => {
 *   div.style.transform = `translate3d(${x}px, 0, 0)`;
 * });
 * ```
 *
 * ### Example
 *
 * Providing a custom timestamp provider
 *
 * ```ts
 * import { animationFrames, TimestampProvider } from 'rxjs';
 *
 * // A custom timestamp provider
 * let now = 0;
 * const customTSProvider: TimestampProvider = {
 *   now() { return now++; }
 * };
 *
 * const source$ = animationFrames(customTSProvider);
 *
 * // Log increasing numbers 0...1...2... on every animation frame.
 * source$.subscribe(x => console.log(x));
 * ```
 *
 * @param timestampProvider An object with a `now` method that provides a numeric timestamp
 */
export function animationFrames(timestampProvider: TimestampProvider = Date) {
  return timestampProvider === Date ? DEFAULT_ANIMATION_FRAMES : animationFramesFactory(timestampProvider);
}

/**
 * Does the work of creating the observable for `animationFrames`.
 * @param timestampProvider The timestamp provider to use to create the observable
 */
function animationFramesFactory(timestampProvider: TimestampProvider) {
  return new Observable<number>(subscriber => {
    subscriberState.push(subscriber, timestampProvider, timestampProvider.now());
    startAnimationLoop();
    return () => {
      if (isCurrentlyNotifying) {
        // The `animate` loop is currently firing. We need to wait before we
        // remove the subscriber from the list.
        subscribersToRemoveAfterRun.push(subscriber);
      } else {
        removeSubscriber(subscriber);
      }
    };
  });
}

/**
 * In the common case, where `Date` is passed to `animationFrames`, we use
 * this shared observable to reduce memory pressure.
 */
const DEFAULT_ANIMATION_FRAMES = animationFramesFactory(Date);

/**
 * Removes a subscriber, and its accompanying data, from the list that gets notified when an animation frame has fired.
 *
 * NOTE: This implementation is relying on the fact that `subscriber` will always be a different instance as it is passed
 * into the observable's initialization function (passed to the Observable ctor).
 *
 * @param subscriber the subscriber to remove from the list of subscribers to notify
 */
function removeSubscriber(subscriber: Subscriber<any>) {
  const index = subscriberState.indexOf(subscriber);
  if (index >= 0) {
    // Remove the subscriber and its timestampProvider
    subscriberState.splice(index, 3);
    if (subscriberState.length === 0) {
      stopAnimationLoop();
    }
  }
}

/**
 * The currently scheduled animation frame id.
 */
let scheduledAnimationId = 0;

/**
 * If `true`, the `animate` loop is currently notifying the subscribers.
 *
 * We have this so we can see if unsubscription should defer the removal of subscribers from
 * the inner list. This is okay, because subscribers that are already unsubscribed will not notify,
 * and it saves us from needing to copy the array of subscribers prior to the run loop.
 */
let isCurrentlyNotifying = false;

/**
 * Starts the animation frame `animate` loop, if necessary.
 * Idempotent. If called and it's already scheduled to start, it will not reschedule or cancel.
 */
function startAnimationLoop() {
  if (scheduledAnimationId === 0) {
    scheduledAnimationId = requestAnimationFrame(animate);
  }
}

/**
 * Executes notification of all subscribers, then reschedules itself.
 * Do not call directly. This is the "run loop".
 */
function animate() {
  // Flag to to make sure unsubscription knows it cannot remove subscribers at this time
  // If an unsubscribe occurs (due to a `next` call side effect), this flag will tell it
  // to defer the removal of the subscription, this saves us from having to copy the array
  // of subscribers.
  isCurrentlyNotifying = true;
  for (let i = 0; i < subscriberState.length; i += 3) {
    const subscriber = subscriberState[i] as Subscriber<number>;
    const timestampProvider = subscriberState[i + 1] as TimestampProvider;
    const startTime = subscriberState[i + 2] as number;
    subscriber.next(timestampProvider.now() - startTime);
  }
  isCurrentlyNotifying = false;

  // Clean up any subscribers that were removed by side effects during notification above.
  while (subscribersToRemoveAfterRun.length > 0) {
    removeSubscriber(subscribersToRemoveAfterRun.shift());
  }

  if (subscriberState.length > 0) {
    // Schedule this to fire again.
    scheduledAnimationId = requestAnimationFrame(animate);
  }
}

/**
 * Stops the animation frame `animate` loop.
 */
function stopAnimationLoop() {
  // We only want to stop the animation frame if we actually have one scheduled.
  // DEV TIP: There should be nothing in `subscriberState` at this point!
  if (scheduledAnimationId) {
    cancelAnimationFrame(scheduledAnimationId);
    // Ensure we reset the animation frame so we can start it again in `start`.
    scheduledAnimationId = 0;
  }
}
