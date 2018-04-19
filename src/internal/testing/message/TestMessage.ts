import { Notification } from '../../Notification';
import { SubscriptionLog } from '../SubscriptionLog';

/**
 * Represents interface for single metadata value emitted by HotObservable<T> or ColdObservable<T>
 *
 */
export interface TestMessage<T = string> {
  frame: number;
  notification: Notification<T>;
  isGhost?: boolean;
}

/**
 * Represents single metadata value emitted by HotObservable<T> or ColdObservable<T>
 *
 */
export class TestMessageValue<T = string> implements TestMessage<T> {
  constructor(public readonly frame: number, public readonly notification: Notification<T>) {}
}

/**
 * Utility function to generate TestMessage represents value for Observer::next()
 * @param frame virtual frame time when value will be emitted
 * @param value
 */

export const next = <T = string>(frame: number, value: T): TestMessage<T> =>
  new TestMessageValue(frame, Notification.createNext(value));

/**
 * Utility function to generate TestMessage represents error for Observer::error()
 * @param frame virtual frame time when value will be emitted
 * @param value
 */
export const error = (frame: number, error: any = '#'): TestMessage<any> =>
  new TestMessageValue<any>(frame, Notification.createError(error));

/**
 * Utility function to generate TestMessage represents completion for Observer::complete()
 * @param frame virtual frame time when value will be emitted
 */
export const complete = <T = void>(frame: number): TestMessage<T> =>
  new TestMessageValue<T>(frame, Notification.createComplete());

export const subscribe = (
  subscribedFrame: number = Number.POSITIVE_INFINITY,
  unsubscribedFrame: number = Number.POSITIVE_INFINITY
) => new SubscriptionLog(subscribedFrame, unsubscribedFrame);
