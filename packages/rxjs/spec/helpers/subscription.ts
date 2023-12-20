/** @prettier */
import type { TeardownLogic } from 'rxjs';

export function getRegisteredFinalizers(subscription: any): Exclude<TeardownLogic, void>[] {
  if ('_finalizers' in subscription) {
    return subscription._finalizers ?? [];
  } else {
    throw new TypeError('Invalid Subscription');
  }
}
