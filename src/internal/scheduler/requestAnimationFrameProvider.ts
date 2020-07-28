/** @prettier */
import { Subscription } from '../Subscription';

type RequestAnimationFrameProvider = {
  schedule(callback: FrameRequestCallback): Subscription;
  delegate:
    | {
        requestAnimationFrame: typeof requestAnimationFrame;
        cancelAnimationFrame: typeof cancelAnimationFrame;
      }
    | undefined;
};

export const requestAnimationFrameProvider: RequestAnimationFrameProvider = {
  schedule(callback) {
    let request = requestAnimationFrame;
    let cancel: typeof cancelAnimationFrame | undefined = cancelAnimationFrame;
    // Use the variable rather than `this` so that the function can be called
    // without being bound to the provider.
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
  delegate: undefined,
};
