import { expect } from 'chai';
import { fromScheduled, of, Subscriber } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { symbolObservable } from 'rxjs/internal/util/symbolObservable';
import { Observer } from 'rxjs/internal/types';
import { symbolAsyncIterator } from 'rxjs/internal/util/symbolAsyncIterator';

describe('fromScheduled', () => {
  let testScheduler: TestScheduler;

  let _symbolObservableOrig: Symbol;
  const _existingAsyncIterator = Symbol.asyncIterator;

  before(() => {
    let counter = 0;
    _symbolObservableOrig = Symbol && Symbol.observable;
    Symbol = Symbol || function (desc: string ) { return '' + (counter++); } as any;
    (Symbol as any).observable = (Symbol as any).observable || symbolObservable;

    if (!_existingAsyncIterator) {
      Symbol = Symbol || function (desc: string ) { return '' + (counter++); } as any;
      (Symbol as any).asyncIterator = (Symbol as any).asyncIterator || symbolAsyncIterator;
    }
  });

  after(() => {
    (Symbol as any).observable = _symbolObservableOrig;
    if (!_existingAsyncIterator) {
      (Symbol as any).asyncIterator = undefined;
    }
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((a, b) => { expect(a).to.deep.equal(b); });
  });

  it('should exist', () => {
    expect(fromScheduled).to.exist;
  });

  it('should handle an array', () => {
    let log: any[] = [];

    fromScheduled([1, 2, 3, 4], testScheduler)
    .subscribe({
      next(value) { log.push(value); },
      complete() { log.push('done'); }
    });

    expect(log).to.deep.equal([]);
    testScheduler.flush();

    expect(log).to.deep.equal([1, 2, 3, 4, 'done']);
  });

  it('should handle an iterable', () => {
    let log: any[] = [];

    const iterable: Iterable<number> = {
      _counter: 0,
      next() {
        if (this._counter < 5) {
          return { done: false, value: this._counter++ };
        } else {
          return { done: true };
        }
      },
      [Symbol.iterator]() {
        return this;
      }
    } as any;

    fromScheduled(iterable, testScheduler)
    .subscribe({
      next(value) { log.push(value); },
      complete() { log.push('done'); }
    });

    expect(log).to.deep.equal([]);
    testScheduler.flush();

    expect(log).to.deep.equal([0, 1, 2, 3, 4, 'done']);
  });

  it('should handle Observable', () => {
    const log: any[] = [];
    const source = of(1, 2, 3, 4);

    fromScheduled(source, testScheduler)
    .subscribe({
      next(value) { log.push(value); },
      complete() { log.push('done'); }
    });

    expect(log).to.deep.equal([]);
    testScheduler.flush();

    expect(log).to.deep.equal([1, 2, 3, 4, 'done']);
  });

  it('should handle Symbol.observable', () => {
    let unsubscribeCalled = false;
    const logs: any[] = [];

    const source = {
      subscribe(observer: Subscriber<number>) {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();

        return {
          unsubscribe() {
            unsubscribeCalled = true;
          }
        };
      },
      [Symbol.observable]() {
        return this;
      }
    };

    fromScheduled(source, testScheduler).subscribe({
      next(value) { logs.push(value); },
      complete() { logs.push('done'); },
    });

    expect(logs).to.deep.equal([]);
    expect(unsubscribeCalled).to.be.false;

    testScheduler.flush();

    expect(logs).to.deep.equal([1, 2, 3, 'done']);
    expect(unsubscribeCalled).to.be.true;
  });

  it('should handle resolved PromiseLikes', () => {
    const logs: any[] = [];

    const promiseLike: PromiseLike<string> = {
      then(resolved, rejected) {
        resolved('test');
        return undefined;
      }
    };

    fromScheduled(promiseLike, testScheduler).subscribe({
      next(value) { logs.push(value); },
      complete() { logs.push('done'); },
    });

    expect(logs).to.deep.equal([]);

    testScheduler.flush();

    expect(logs).to.deep.equal(['test', 'done']);
  });

  it('should handle rejected PromiseLikes', () => {
    const logs: any[] = [];

    const promiseLike: PromiseLike<string> = {
      then(resolved, rejected) {
        rejected('LOL');
        return undefined;
      }
    };

    fromScheduled(promiseLike, testScheduler).subscribe({
      next(value) { logs.push(value); },
      error(err) { logs.push(err); },
      complete() { logs.push('done'); },
    });

    expect(logs).to.deep.equal([]);

    testScheduler.flush();

    expect(logs).to.deep.equal(['LOL']);
  });

  it('should handle asyncIterables', () => {
    const logs: any[] = [];

    const asyncIterable: AsyncIterable<number> = {
      _counter: 0,
      [Symbol.asyncIterator]() {
        return this;
      },
      next() {
        if (this._counter <= 3) {
          return {
            then: (resolve) => {
              resolve({ done: false, value: this._counter++ });
            }
          } as PromiseLike<any>;
        } else {
          return {
            then: (resolve) => {
              resolve({ done: true });
            }
          } as PromiseLike<any>;
        }
      }
    } as any;

    fromScheduled(asyncIterable, testScheduler).subscribe({
      next(value) { logs.push(value); },
      complete() { logs.push('done'); },
    });

    expect(logs).to.deep.equal([]);

    testScheduler.flush();

    expect(logs).to.deep.equal([0, 1, 2, 3, 'done']);
  });

  it('should handle errored asyncIterables', () => {
    const logs: any[] = [];

    const asyncIterable: AsyncIterable<number> = {
      _counter: 0,
      [Symbol.asyncIterator]() {
        return this;
      },
      next() {
        if (this._counter <= 3) {
          return {
            then: (resolve) => {
              resolve({ done: false, value: this._counter++ });
            }
          } as PromiseLike<any>;
        } else {
          return {
            then: (resolve, reject) => {
              reject('LOL');
            }
          } as PromiseLike<any>;
        }
      }
    } as any;

    fromScheduled(asyncIterable, testScheduler).subscribe({
      next(value) { logs.push(value); },
      error(err) { logs.push(err); },
      complete() { logs.push('done'); },
    });

    expect(logs).to.deep.equal([]);

    testScheduler.flush();

    expect(logs).to.deep.equal([0, 1, 2, 3, 'LOL']);
  });
});
