import { Observable } from './Observable';
import { Observer, PartialObserver, ObservableInput } from './types';
import { hostReportError } from './util/hostReportError';
import { from } from './observable/from';

/**
 * Glues any observer to any observable to make a "subject".
 *
 * Assembles the parts like Frankenstein to make your own monster.
 *
 * Developer's note: `FrankenSubject` does NOT extend `Subject`, therefor
 * `instanceof Subject` checks will not work.
 */
export class FrankenSubject<In, Out> extends Observable<Out> implements Observer<In> {
  private _closed = false;

  get closed() {
    return this._closed;
  }

  constructor(private observer: PartialObserver<In>, source: ObservableInput<Out>) {
    super();
    this.source = from(source);
  }

  next(value: In): void {
    if (!this.closed) {
      this.observer.next?.(value);
    }
  }

  error(err: any): void {
    if (!this._closed) {
      this._closed = true;
      if (typeof this.observer.error === 'function') {
        this.observer.error(err);
      } else {
        hostReportError(err);
      }
    }
  }

  complete(): void {
    if (!this._closed) {
      this._closed = true;
      this.observer.complete?.();
    }
  }

  asObservable() {
    return this.source;
  }
}