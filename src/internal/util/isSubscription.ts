import { Subscription } from 'rxjs/internal/Subscription';

export function isSubscription(obj: any): obj is Subscription {
  return obj && (obj instanceof Subscription || typeof obj.unsubscribe === 'function'
    && typeof obj.add === 'function');
}
