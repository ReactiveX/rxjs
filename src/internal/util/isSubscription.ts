import { Subscription } from "rxjs/internal/Subscription";

export function isSubscription(obj: any): obj is Subscription {
  return obj && typeof obj.unsubscribe === 'function'
    && typeof obj.add === 'function'
    && typeof obj.remove=== 'function' ;
}
