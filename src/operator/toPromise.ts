import { Observable } from '../Observable';
import { root } from '../util/root';

/**
 * @param PromiseCtor
 * @return {Promise<T>}
 * @method toPromise
 * @owner Observable
 */
/* tslint:disable:max-line-length */
export function toPromise<T>(this: Observable<T>): Promise<T>;
export function toPromise<T>(this: Observable<T>, PromiseCtor: typeof Promise): Promise<T>;
/* tslint:disable:max-line-length */
export function toPromise<T>(this: Observable<T>, PromiseCtor?: typeof Promise): Promise<T> {
  if (!PromiseCtor) {
    if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
      PromiseCtor = root.Rx.config.Promise;
    } else if (root.Promise) {
      PromiseCtor = root.Promise;
    }
  }

  if (!PromiseCtor) {
    throw new Error('no Promise impl found');
  }

  return new PromiseCtor((resolve, reject) => {
    let value: any;
    this.subscribe((x: T) => value = x, (err: any) => reject(err), () => resolve(value));
  });
}
