import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {PromiseObservable} from './PromiseObservable';
import {EmptyObservable} from './EmptyObservable';
import {isPromise} from '../util/isPromise';
import {isArray} from '../util/isArray';

/**
 *
 */
export class ForkJoinObservable<T> extends Observable<T> {
  constructor(private sources: Array<Observable<any> | Promise<any>>,
              private resultSelector?: (...values: Array<any>) => T) {
    super();
  }

  /**
   * @param sources
   * @return {any}
   * @static true
   * @name forkJoin
   * @owner Observable
   */
  static create<T>(...sources: Array<Observable<any> | Promise<any> |
                                  Array<Observable<any>> |
                                  ((...values: Array<any>) => any)>): Observable<T> {
    if (sources === null || arguments.length === 0) {
      return new EmptyObservable<T>();
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

    if (sources.length === 0) {
      return new EmptyObservable<T>();
    }

    return new ForkJoinObservable(<Array<Observable<any> | Promise<any>>>sources, resultSelector);
  }

  protected _subscribe(subscriber: Subscriber<any>) {
    const sources = this.sources;
    const len = sources.length;

    const context = { completed: 0,
                      total: len,
                      values: new Array(len),
                      haveValues: new Array(len),
                      selector: this.resultSelector };

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

  constructor(destination: Subscriber<any>,
              private index: number,
              private context: { completed: number,
                                 total: number,
                                 values: any[],
                                 haveValues: any[],
                                 selector: (...values: Array<any>) => any }) {
    super(destination);
  }

  protected _next(value: T): void {
    const context = this.context;
    const index = this.index;

    context.values[index] = value;
    context.haveValues[index] = true;
  }

  protected _complete(): void {
    const destination = this.destination;
    const context = this.context;

    if (!context.haveValues[this.index]) {
      destination.complete();
    }

    context.completed++;

    const values = context.values;

    if (context.completed !== values.length) {
      return;
    }

    if (context.haveValues.every(hasValue)) {
      const value = context.selector ? context.selector.apply(this, values) :
                                     values;
      destination.next(value);
    }

    destination.complete();
  }
}

function hasValue(x: any): boolean {
  return x === true;
}
