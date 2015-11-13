import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {PromiseObservable} from './PromiseObservable';
import {EmptyObservable} from './EmptyObservable';
import {isPromise} from '../util/isPromise';

export class ForkJoinObservable<T> extends Observable<T> {
  constructor(private sources: Array<Observable<any> |
                                    Promise<any> |
                                    ((...values: Array<any>) => any)>) {
     super();
  }

  static create(...sources: Array<Observable<any> |
                                  Promise<any> |
                                  ((...values: Array<any>) => any)>)
                                  : Observable<any> {
    if (sources === null || sources.length === 0) {
      return new EmptyObservable();
    }
    return new ForkJoinObservable(sources);
  }

  private getResultSelector(): (...values: Array<any>) => any {
    const sources = this.sources;

    let resultSelector = sources[sources.length - 1];
    if (typeof resultSelector !== 'function') {
      return null;
    }
    this.sources.pop();
    return <(...values: Array<any>) => any>resultSelector;
  }

  _subscribe(subscriber: Subscriber<any>) {
    let resultSelector = this.getResultSelector();
    const sources = this.sources;
    const len = sources.length;

    const context = { completed: 0, total: len, values: emptyArray(len), selector: resultSelector };
    for (let i = 0; i < len; i++) {
      let source = sources[i];
      if (isPromise(source)) {
        source = new PromiseObservable(<Promise<any>>source);
      }
      (<Observable<any>>source).subscribe(new AllSubscriber(subscriber, i, context));
    }
  }
}

class AllSubscriber<T> extends Subscriber<T> {
  private _value: any = null;

  constructor(destination: Subscriber<any>,
              private index: number,
              private context: { completed: number,
                                 total: number,
                                 values: any[],
                                 selector: (...values: Array<any>) => any }) {
    super(destination);
  }

  _next(value: any): void {
    this._value = value;
  }

  _complete(): void {
    const destination = this.destination;

    if (this._value == null) {
      destination.complete();
    }

    const context = this.context;
    context.completed++;
    context.values[this.index] = this._value;
    const values = context.values;

    if (context.completed !== values.length) {
      return;
    }

    if (values.every(hasValue)) {
      let value = context.selector ? context.selector.apply(this, values) :
                                     values;
      destination.next(value);
    }

    destination.complete();
  }
}

function hasValue(x: any): boolean {
  return x !== null;
}

function emptyArray(len: number): any[] {
  let arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(null);
  }
  return arr;
}
