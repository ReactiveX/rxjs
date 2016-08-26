import { root } from '../util/root';

/**
 * @param PromiseCtor
 * @return {Promise<T>}
 * @method toPromise
 * @owner Observable
 */
export function toPromise<T>(PromiseCtor?: typeof Promise): Promise<T> {
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

export interface ToPromiseSignature<T> {
  (): Promise<T>;
  (PromiseCtor: typeof Promise): Promise<T>;
}
