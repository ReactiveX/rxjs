/** @prettier */
import { Subscription } from '../Subscription';

type RequestAnimationFrameProvider = {
  schedule(callback: FrameRequestCallback): Subscription;
  requestAnimationFrame: typeof requestAnimationFrame;
  cancelAnimationFrame: typeof cancelAnimationFrame;
  delegate:
    | {
        requestAnimationFrame: typeof requestAnimationFrame;
        cancelAnimationFrame: typeof cancelAnimationFrame;
      }
    | undefined;
};

export const requestAnimationFrameProvider: RequestAnimationFrameProvider = {
  // When accessing the delegate, use the variable rather than `this` so that
  // the function can be called without being bound to the provider.
  schedule(callback) {
    let request = requestAnimationFrame;
    let cancel: typeof cancelAnimationFrame | undefined = cancelAnimationFrame;
    const { delegate } = requestAnimationFrameProvider;
    if (delegate) {
      request = delegate.requestAnimationFrame;
      cancel = delegate.cancelAnimationFrame;
    }
    const handle = request((timestamp) => {
      // Clear the cancel function. The request has been fulfilled, so
      // attempting to cancel the request upon unsubscription would be
      // pointless.
      cancel = undefined;
      callback(timestamp);
    });
    return new Subscription(() => cancel?.(handle));
  },
  requestAnimationFrame(...args) {
    const { delegate } = requestAnimationFrameProvider;
    return (delegate?.requestAnimationFrame || requestAnimationFrame)(...args);
  },
  cancelAnimationFrame(...args) {
    const { delegate } = requestAnimationFrameProvider;
    return (delegate?.cancelAnimationFrame || cancelAnimationFrame)(...args);
  },
  delegate: undefined,
};
