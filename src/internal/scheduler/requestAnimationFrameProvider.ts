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
    let cancel = cancelAnimationFrame;
    // Use the variable rather than `this` so that the function can be called
    // without being bound to the provider.
    const { delegate } = requestAnimationFrameProvider;
    if (delegate) {
      request = delegate.requestAnimationFrame;
      cancel = delegate.cancelAnimationFrame;
    }
    const handle = request(callback);
    return new Subscription(() => cancel(handle));
  },
  delegate: undefined,
};
