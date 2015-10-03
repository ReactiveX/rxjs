import Observable from '../Observable';
import Observer from '../Observer';
import Subscriber from '../Subscriber';

export default class ForkJoinObservable<T> extends Observable<T> {
  constructor(private observables: Observable<any>[]) {
    super();
  }

  static create<R>(...observables: Observable<any>[]): Observable<R> {
    return new ForkJoinObservable(observables);
  }

  _subscribe(subscriber: Subscriber<any>) {
    const observables = this.observables;
    const len = observables.length;
    let context = { complete: 0, total: len, values: emptyArray(len) };
    for (let i = 0; i < len; i++) {
      observables[i].subscribe(new AllSubscriber(subscriber, this, i, context));
    }
  }
}

class AllSubscriber<T> extends Subscriber<T> {
  private _value: T;

  constructor(destination: Subscriber<T>,
              private parent: ForkJoinObservable<T>,
              private index: number,
              private context: { complete: number, total: number, values: any[] }) {
    super(destination);
  }

  _next(value: T) {
    this._value = value;
  }

  _complete() {
    const context = this.context;
    context.values[this.index] = this._value;
    if (context.values.every(hasValue)) {
      this.destination.next(context.values);
      this.destination.complete();
    }
  }
}

function hasValue(x) {
  return x !== null;
}

function emptyArray(len: number): any[] {
  let arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(null);
  }
  return arr;
}