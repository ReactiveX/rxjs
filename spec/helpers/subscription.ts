/** @prettier */
import { TeardownLogic } from 'rxjs';

export function getRegisteredTeardowns(subscription: any): Exclude<TeardownLogic, void>[] {
  if ('_teardowns' in subscription) {
    return subscription._teardowns ?? [];
  } else {
    throw new TypeError('Invalid Subscription');
  }
}
