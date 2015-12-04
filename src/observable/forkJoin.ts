import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {PromiseObservable} from './fromPromise';
import {EmptyObservable} from './empty';
import {isPromise} from '../util/isPromise';
import {isArray} from '../util/isArray';

export class ForkJoinObservable<T> extends Observable<T> {
  constructor(private sources: Array<Observable<any> | Promise<any>>,
              private resultSelector?: (...values: Array<any>) => any) {
    super();
  }

  static create(...sources: Array<Observable<any> |
                                  Array<Observable<any>> |
                                  Promise<any> |
                                  ((...values: Array<any>) => any)>): Observable<any> {
    if (sources === null || arguments.length === 0) {
      return new EmptyObservable();
    }

    let resultSelector: (...values: Array<any>) => any = null;
    if (typeof sources[sources.length - 1] === 'function') {
      resultSelector = <(...values: Array<any>) => any>sources.pop();
    }

    // if the first and only other argument besides the resultSelector is an array
    // assume it's been called with `forkJoin([obs1, obs2, obs3], resultSelector)`
    if (sources.length === 1 && isArray(sources[0])) {
      sources = <Array<Observable<any>>>sources[0];
    }

    return new ForkJoinObservable(<Array<Observable<any> | Promise<any>>>sources, resultSelector);
  }

  _subscribe(subscriber: Subscriber<any>) {
    const sources = this.sources;
    const len = sources.length;

    const context = { completed: 0, total: len, values: emptyArray(len), selector: this.resultSelector };
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
