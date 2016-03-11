import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {noop} from '../util/noop';

/**
 *
 */
export class NeverObservable<T> extends Observable<T> {
  " tag_class_NeverObservable": T;

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
