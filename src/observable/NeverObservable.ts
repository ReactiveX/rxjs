import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class NeverObservable<T> extends Observable<T> {
  /**
   * @return {NeverObservable<T>}
   * @static true
   * @name never
   * @owner Observable
   */
  static create<T>() {
    return new NeverObservable<T>();
  }

  constructor() {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>): void {
    noop();
  }
}
