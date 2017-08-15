
/* tslint:disable:no-unused-variable */
import { Observable, Subscribable, SubscribableOrPromise } from '../Observable';
/* tslint:enable:no-unused-variable */
import { defer } from './defer';
import { _throw } from './throw';
import { empty } from './empty';

export const _if = <T, R>(condition: () => boolean | void,
  thenSource?: SubscribableOrPromise<T> | void,
  elseSource?: SubscribableOrPromise<R> | void): Observable<T|R> =>
    defer<T|R>(() => {
      let result: boolean;
      try {
        result = Boolean(condition());
      } catch (err) {
        return _throw(err);
      }

      if (result) {
        return thenSource || empty();
      } else {
        return elseSource || empty();
      }
    });
