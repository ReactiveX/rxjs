/** @prettier */
import { FinalizationLogic } from 'rxjs';

export function getRegisteredFinalizations(subscription: any): Exclude<FinalizationLogic, void>[] {
  if ('_finalizations' in subscription) {
    return subscription._finalizations ?? [];
  } else {
    throw new TypeError('Invalid Subscription');
  }
}
