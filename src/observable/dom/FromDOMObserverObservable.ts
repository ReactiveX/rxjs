import { Observable } from '../../Observable';
import { isArray } from '../../util/isArray';
import { Subscriber } from '../../Subscriber';

export type RecordCallback = (record: any, ...rest: any[]) => void;

export interface DOMObserver {
  new (callback: RecordCallback, ...rest: any[]): DOMObserver;
  observe(...rest: any[]): void;
  disconnect(): void;
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromDOMObserverObservable<T> extends Observable<T> {
  // Arguments to the Observer's `.observe()` method
  private observeArgs: any[];

  static create<T>(DOMObserverCtor: any, ...args: any[]): Observable<T>;

  /**
   * Creates an observable sequence from a DOM-style Observer.
   *
   * Emits individual items in the observable even if they were returned as batched
   * array or EntryList (as with PerformanceObservers) in the original DOM Observable.
   *
   * Known to work with DOM `MutationObserver`, `IntersectionObserver`, and `PerformanceObserver`
   *
   * A DOM-style Observer is defined as implementing the following interface:
   *
   *  export interface DOMObserver {
   *   constructor: new (callback: Function, ...rest: any[]) => DOMObserver;
   *    observe(...rest: any[]): void;
   *    disconnect(): void;
   *  }
   *
   * @example
   *  var mutations = Rx.DOM.fromDOMObserver(
   *   MutationObserver,
   *   document.getElementById('foo'),
   *   { attributes: true, childList: true, characterData: true }
   *  );
   *
   * mutations.subscribe(record => console.log(record));
   *
   * // Results in:
   * // MutationRecord objects logged *individually* to console every time
   * // a mutation occurs. Note that typically DOM MutationObservers provide
   * // lists of records at a time. Instead, individual records are synchonrously
   * // emitted from the RxJS Observable.
   *
   * @param {Function} ObserverCtor The constructor for the DOM Observer
   *   (e.g. MutationObserver, PerformanceObserver, IntersectionObserver, etc)
   * @param {...*} args The remainder of arguments corresponding to the DOM Observer's `observe` method
   * @return {Obsevable<T>} An observable sequence which emits individual entries from the DOM Observer
   * @static true
   * @name fromDOMObserver
   * @owner Observable
   */

  static create<T>(DOMObserverCtor: Function, ...args: any[]): Observable<T> {
    return new FromDOMObserverObservable(DOMObserverCtor, ...args);
  }

  constructor(private ObserverCtor: any, ...observeArgs: any[]) {
    super();
    this.observeArgs = observeArgs;
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const domObserver = new this.ObserverCtor((record: any) => {
      let entries: any[];
      if (typeof record.getEntries === 'function') {
        // An EntryList, such as a PerformanceObserverEntryList
        entries = record.getEntries();
      } else if (isArray(record)) {
        entries = record;
      } else {
        subscriber.next(record);
        return;
      }

      for (let i = 0; i < entries.length; i++) {
        subscriber.next(entries[i]);
      }
    });

    subscriber.add(() => domObserver.disconnect());
    domObserver.observe(...this.observeArgs);
  }
}
