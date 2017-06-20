/* tslint:disable:no-unused-variable */
import { Observable, Subscribable, SubscribableOrPromise } from '../Observable';
/* tslint:enable:no-unused-variable */
import { AnonymousSubscription } from '../Subscription';
import { Subscription } from '../Subscription';
import { from } from './from';
import { noop } from '../util/noop';

export const using = <T>(resourceFactory: () => AnonymousSubscription | void,
  observableFactory: (resource: AnonymousSubscription) => SubscribableOrPromise<T> | void): Observable<T> =>
    new Observable<T>(observer => {
      let resource: AnonymousSubscription | void;
      try {
        resource = resourceFactory();
      } catch (err) {
        observer.error(err);
        return noop;
      }

      const source: SubscribableOrPromise<T> | void = observableFactory(resource || Subscription.EMPTY); ;
      let subscription: Subscription;
      if (!source) {
        observer.complete();
      } else {
        subscription = from(source).subscribe(observer);
      }

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        if (resource) {
          resource.unsubscribe();
        }
      };
    });
