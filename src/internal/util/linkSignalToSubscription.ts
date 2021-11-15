import { Subscription } from '../Subscription';

export function linkSignalToSubscription(signal: AbortSignal, subscription: Subscription, onAbort: () => void) {
  const handler = () => {
    subscription.unsubscribe();
    onAbort();
  };
  signal.addEventListener('abort', handler, { once: true });
  subscription.add(() => {
    signal.removeEventListener('abort', handler);
  });
}
