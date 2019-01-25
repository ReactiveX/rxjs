import { Subscription } from 'rxjs/internal/Subscription';

export function recycleSubscription(subscription: Subscription) {
  (subscription as any)._unsubscribe();
}
