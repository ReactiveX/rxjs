import {Observable} from '../Observable';
import {ArrayObservable} from '../observable/ArrayObservable';
import {isArray} from '../util/isArray';
import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {OuterSubscriber} from '../OuterSubscriber';
import {subscribeToResult} from '../util/subscribeToResult';
import {SymbolShim} from '../util/SymbolShim';

export function zipProto<R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  observables.unshift(this);
  return zipStatic.apply(this, observables);
}

export function zipStatic<T, R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  const project = <((...ys: Array<any>) => R)> observables[observables.length - 1];
  if (typeof project === 'function') {
    observables.pop();
  }
  return new ArrayObservable(observables).lift<T, R>(new ZipOperator<T, R>(project));
}

export class ZipOperator<T, R> implements Operator<T, R> {

  project: (...values: Array<any>) => R;

  constructor(project?: (...values: Array<any>) => R) {
    this.project = project;
  }

  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new ZipSubscriber(subscriber, this.project);
  }
}

export class ZipSubscriber<T, R> extends Subscriber<T> {
  private index = 0;
  private values: any;
  private project: (...values: Array<any>) => R;
  private iterators: LookAheadIterator<any>[] = [];
  private active = 0;

  constructor(destination: Subscriber<R>,
              project?: (...values: Array<any>) => R,
              values: any = Object.create(null)) {
    super(destination);
    this.project = (typeof project === 'function') ? project : null;
    this.values = values;
  }

  protected _next(value: any) {
    const iterators = this.iterators;
    const index = this.index++;
    if (isArray(value)) {
      iterators.push(new StaticArrayIterator(value));
    } else if (typeof value[SymbolShim.iterator] === 'function') {
      iterators.push(new StaticIterator(value[SymbolShim.iterator]()));
    } else {
      iterators.push(new ZipBufferIterator(this.destination, this, value, index));
    }
  }

  protected _complete() {
    const iterators = this.iterators;
    const len = iterators.length;
    this.active = len;
    for (let i = 0; i < len; i++) {
      let iterator: ZipBufferIterator<any, any> = <any>iterators[i];
      if (iterator.stillUnsubscribed) {
        this.add(iterator.subscribe(iterator, i));
      } else {
        this.active--; // not an observable
      }
    }
  }

  notifyInactive() {
    this.active--;
    if (this.active === 0) {
      this.destination.complete();
    }
  }

  checkIterators() {
    const iterators = this.iterators;
    const len = iterators.length;
    const destination = this.destination;

    // abort if not all of them have values
    for (let i = 0; i < len; i++) {
      let iterator = iterators[i];
      if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
        return;
      }
    }

    let shouldComplete = false;
    const args: any[] = [];
    for (let i = 0; i < len; i++) {
      let iterator = iterators[i];
      let result = iterator.next();

      // check to see if it's completed now that you've gotten
      // the next value.
      if (iterator.hasCompleted()) {
        shouldComplete = true;
      }

      if (result.done) {
        destination.complete();
        return;
      }

      args.push(result.value);
    }

    const project = this.project;
    if (project) {
      let result = tryCatch(project).apply(this, args);
      if (result === errorObject) {
        destination.error(errorObject.e);
      } else {
        destination.next(result);
      }
    } else {
      destination.next(args);
    }

    if (shouldComplete) {
      destination.complete();
    }
  }
}

interface LookAheadIterator<T> extends Iterator<T> {
  hasValue(): boolean;
  hasCompleted(): boolean;
}

class StaticIterator<T> implements LookAheadIterator<T> {
  private nextResult: IteratorResult<T>;

  constructor(private iterator: Iterator<T>) {
    this.nextResult = iterator.next();
  }

  hasValue() {
    return true;
  }

  next(): IteratorResult<T> {
    const result = this.nextResult;
    this.nextResult = this.iterator.next();
    return result;
  }

  hasCompleted() {
    const nextResult = this.nextResult;
    return nextResult && nextResult.done;
  }
}

class StaticArrayIterator<T> implements LookAheadIterator<T> {
  private index = 0;
  private length = 0;

  constructor(private array: T[]) {
    this.length = array.length;
  }

  [SymbolShim.iterator]() {
    return this;
  }

  next(value?: any): IteratorResult<T> {
    const i = this.index++;
    const array = this.array;
    return i < this.length ? { value: array[i], done: false } : { done: true };
  }

  hasValue() {
    return this.array.length > this.index;
  }

  hasCompleted() {
    return this.array.length === this.index;
  }
}

class ZipBufferIterator<T, R> extends OuterSubscriber<T, R> implements LookAheadIterator<T> {
  stillUnsubscribed = true;
  buffer: T[] = [];
  isComplete = false;

  constructor(destination: Observer<T>,
              private parent: ZipSubscriber<T, R>,
              private observable: Observable<T>,
              private index: number) {
    super(destination);
  }

  [SymbolShim.iterator]() {
    return this;
  }

  // NOTE: there is actually a name collision here with Subscriber.next and Iterator.next
  //    this is legit because `next()` will never be called by a subscription in this case.
  next(): IteratorResult<T> {
    const buffer = this.buffer;
    if (buffer.length === 0 && this.isComplete) {
      return { done: true };
    } else {
      return { value: buffer.shift(), done: false };
    }
  }

  hasValue() {
    return this.buffer.length > 0;
  }

  hasCompleted() {
    return this.buffer.length === 0 && this.isComplete;
  }

  notifyComplete() {
    if (this.buffer.length > 0) {
      this.isComplete = true;
      this.parent.notifyInactive();
    } else {
      this.destination.complete();
    }
  }

  notifyNext(outerValue: any, innerValue: any, outerIndex: number, innerIndex: number) {
    this.buffer.push(innerValue);
    this.parent.checkIterators();
  }

  subscribe(value: any, index: number) {
    return subscribeToResult<any, any>(this, this.observable, this, index);
  }
}
