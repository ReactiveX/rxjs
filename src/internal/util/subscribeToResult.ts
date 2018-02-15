
import { ObservableInput } from '../types';
import { Subscription } from '../Subscription';
import { InnerSubscriber } from '../InnerSubscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeTo } from './subscribeTo';

export function subscribeToResult<T, R>(outerSubscriber: OuterSubscriber<T, R>,
                                        result: any,
                                        outerValue?: T,
                                        outerIndex?: number): Subscription;
export function subscribeToResult<T>(outerSubscriber: OuterSubscriber<any, any>,
                                     result: ObservableInput<T>,
                                     outerValue?: T,
                                     outerIndex?: number): Subscription | void {
  const destination = new InnerSubscriber(outerSubscriber, outerValue, outerIndex);

  return subscribeTo(result)(destination);
}
