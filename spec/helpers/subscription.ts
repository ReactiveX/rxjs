/** @prettier */
import { FinalizerLogic } from 'rxjs';

export function getRegisteredFinalizers(subscription: any): Exclude<FinalizerLogic, void>[] {
  if ('_finalizers' in subscription) {
    return subscription._finalizers ?? [];
  } else {
    throw new TypeError('Invalid Subscription');
  }
}
