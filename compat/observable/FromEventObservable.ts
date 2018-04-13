import { Observable, fromEvent } from 'rxjs';
import { EventTargetLike } from 'rxjs/internal-compatibility';

export class FromEventObservable<T> extends Observable<T> {
  /* tslint:disable:max-line-length */
  static create<T>(target: EventTargetLike<T>, eventName: string): Observable<T>;
  static create<T>(target: EventTargetLike<T>, eventName: string, selector: ((...args: any[]) => T)): Observable<T>;
  static create<T>(target: EventTargetLike<T>, eventName: string, options: EventListenerOptions): Observable<T>;
  static create<T>(target: EventTargetLike<T>, eventName: string, options: EventListenerOptions, selector: ((...args: any[]) => T)): Observable<T>;
  /* tslint:enable:max-line-length */

  static create<T>(target: EventTargetLike<T>,
                   eventName: string,
                   options?: EventListenerOptions | ((...args: any[]) => T),
                   selector?: ((...args: any[]) => T)): Observable<T> {
    return fromEvent(target, eventName, options as EventListenerOptions, selector);
  }
}
