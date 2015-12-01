import {Scheduler} from '../Scheduler';
import {Observable} from '../Observable';

import {root} from '../util/root';
import {SymbolShim} from '../util/SymbolShim';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export class IteratorObservable<T> extends Observable<T> {
  private iterator: any;

  static create<T>(iterator: any,
                   project?: (x?: any, i?: number) => T,
                   thisArg?: any,
                   scheduler?: Scheduler) {
    return new IteratorObservable(iterator, project, thisArg, scheduler);
  }

  static dispatch(state) {

    const { index, hasError, thisArg, project, iterator, subscriber } = state;

    if (hasError) {
      subscriber.error(state.error);
      return;
    }

    let result = iterator.next();

    if (result.done) {
      subscriber.complete();
      return;
    }

    if (project) {
      result = tryCatch(project).call(thisArg, result.value, index);
      if (result === errorObject) {
        state.error = errorObject.e;
        state.hasError = true;
      } else {
        subscriber.next(result);
        state.index = index + 1;
      }
    } else {
      subscriber.next(result.value);
      state.index = index + 1;
    }

    if (subscriber.isUnsubscribed) {
      return;
    }

    (<any> this).schedule(state);
  }

  constructor(iterator: any,
              private project?: (x?: any, i?: number) => T,
              private thisArg?: any,
              private scheduler?: Scheduler) {
    super();
    if (iterator == null) {
      throw new Error('iterator cannot be null.');
    }
    if (project && typeof project !== 'function') {
      throw new Error('When provided, `project` must be a function.');
    }
    this.iterator = getIterator(iterator);
  }

  _subscribe(subscriber) {

    let index = 0;
    const { iterator, project, thisArg, scheduler } = this;

    if (scheduler) {
      subscriber.add(scheduler.schedule(IteratorObservable.dispatch, 0, {
        index, thisArg, project, iterator, subscriber
      }));
    } else {
      do {
        let result = iterator.next();
        if (result.done) {
          subscriber.complete();
          break;
        } else if (project) {
          result = tryCatch(project).call(thisArg, result.value, index++);
          if (result === errorObject) {
            subscriber.error(errorObject.e);
            break;
          }
          subscriber.next(result);
        } else {
          subscriber.next(result.value);
        }
        if (subscriber.isUnsubscribed) {
          break;
        }
      } while (true);
    }
  }
}

class StringIterator {
  constructor(private str: string,
              private idx: number = 0,
              private len: number = str.length) {
  }
  [SymbolShim.iterator]() { return (this); }
  next() {
    return this.idx < this.len ? {
        done: false,
        value: this.str.charAt(this.idx++)
    } : {
        done: true,
        value: undefined
    };
  }
}

class ArrayIterator {
  constructor(private arr: Array<any>,
              private idx: number = 0,
              private len: number = toLength(arr)) {
  }
  [SymbolShim.iterator]() { return this; }
  next() {
    return this.idx < this.len ? {
        done: false,
        value: this.arr[this.idx++]
    } : {
        done: true,
        value: undefined
    };
  }
}

function getIterator(obj: any) {
  const i = obj[SymbolShim.iterator];
  if (!i && typeof obj === 'string') {
    return new StringIterator(obj);
  }
  if (!i && obj.length !== undefined) {
    return new ArrayIterator(obj);
  }
  if (!i) {
    throw new TypeError('Object is not iterable');
  }
  return obj[SymbolShim.iterator]();
}

const maxSafeInteger = Math.pow(2, 53) - 1;

function toLength(o) {
  let len = +o.length;
  if (isNaN(len)) {
      return 0;
  }
  if (len === 0 || !numberIsFinite(len)) {
      return len;
  }
  len = sign(len) * Math.floor(Math.abs(len));
  if (len <= 0) {
      return 0;
  }
  if (len > maxSafeInteger) {
      return maxSafeInteger;
  }
  return len;
}

function numberIsFinite(value) {
  return typeof value === 'number' && root.isFinite(value);
}

function sign(value) {
  let valueAsNumber = +value;
  if (valueAsNumber === 0) {
    return valueAsNumber;
  }
  if (isNaN(valueAsNumber)) {
    return valueAsNumber;
  }
  return valueAsNumber < 0 ? -1 : 1;
}
