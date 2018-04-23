import { from } from './from';
import { expect } from 'chai';
import { take } from '../operators/take';
import { Subscription } from '../Subscription';
import { symbolObservable } from '../util/symbolObservable';
import { Observer, ObservableInteroperable } from '../types';
import { symbolAsyncIterator } from '../util/symbolAsyncIterator';

describe('from', () => {
  it('should convert a Promise to an observable', (done) => {
    const results: string[] = [];

    from(Promise.resolve('test'))
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
          expect(results).to.deep.equal(['test', 'done']);
          done();
        },
      });
  });

  describe('from(Array)', () => {
    it('should convert an Array to an observable', () => {
      const results: any[] = [];
      const source = [1, 2, 3];
      from(source)
        .subscribe({
          next(value) { results.push(value); },
          complete() {
            results.push('done');
          },
        });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });

    it('should work with take', () => {
      const results: any[] = [];
      const source = [1, 2, 3, 4, 5];
      from(source).pipe(
        take(3),
      )
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });

  describe('from(ArrayLike)', () => {
    it('should convert an ArrayLike to an observable', () => {
      const results: any[] = [];
      const source = {
        '0': 1,
        '1': 2,
        '2': 3,
        length: 3,
      };

      from(source)
        .subscribe({
          next(value) { results.push(value); },
          complete() {
            results.push('done');
          },
        });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });

    it('should work with take', () => {
      const results: any[] = [];
      const source = {
        '0': 1,
        '1': 2,
        '2': 3,
        '3': 4,
        '4': 5,
        length: 5,
      };

      from(source).pipe(
        take(3),
      )
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });

  describe('from(Iterable)', () => {
    it('should convert an Iterable to an observable', () => {
      const results: any[] = [];
      const source = 'Weee!';

      from(source)
        .subscribe({
          next(value) { results.push(value); },
          complete() {
            results.push('done');
          },
        });

      expect(results).to.deep.equal(['W', 'e', 'e', 'e', '!', 'done']);
    });


    it('should work with take', () => {
      const results: any[] = [];
      const source = 'Weeeeeeeeeeeeeee!';

      from(source).pipe(
        take(3),
      )
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

      expect(results).to.deep.equal(['W', 'e', 'e', 'done']);
    });
  });

  describe('from(Promise)', () => {
    it('should convert a promise to an observable', (done: MochaDone) => {
      const results: any[] = [];
      const promise = Promise.resolve('Dr Boolean says I am an F-, not an A+');

      from(promise).subscribe({
        next(value) { results.push(value); },
        complete() {
          expect(results).to.deep.equal(['Dr Boolean says I am an F-, not an A+']);
          done();
        }
      });
    });

    it('should handle take(0)', (done: MochaDone) => {
      const results: any[] = [];
      const promise = Promise.resolve('Dr Boolean says I am an F-, not an A+');

      from(promise).pipe(
        take(0),
      ).subscribe({
        next(value) { results.push(value); },
        complete() {
          expect(results).to.deep.equal([]);
          done();
        }
      });
    });

    it('should handle early unsubscribe', () => {
      const results: any[] = [];
      const promise = Promise.resolve('Try and stop me');
      let subscription: Subscription;

      Promise.resolve().then(() => {
        subscription.unsubscribe();
      });

      subscription = from(promise).subscribe({
        next(value) { results.push(value); },
        complete() { results.push('done'); }
      });

      return Promise.resolve().then(() => {
        expect(results).to.deep.equal([]);
      });
    });
  });

  describe('from(obj[Symbol.observable])', () => {
    let _original: any;

    before(() => {
      let counter = 0;
      _original = Symbol && Symbol.observable;
      Symbol = Symbol || function (desc: string ) { return '' + (counter++); } as any;
      (Symbol as any).observable = (Symbol as any).observable || symbolObservable;
    });

    after(() => {
      (Symbol as any).observable = _original;
    });

    it('should convert from an Observable-interoperable object to an observable', () => {
      const results: any[] = [];

      const obj = {
        [Symbol.observable]() {
          return {
            subscribe(observer: Observer<number>) {
              observer.next(1);
              observer.next(2);
              observer.next(3);
              observer.complete();
            }
          }
        }
      } as ObservableInteroperable<number>;

      from<number>(obj).subscribe({
        next(value) { results.push(value); },
        complete() { results.push('done') },
      });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });

    it('should return a subscription that unsubscribes the interop subscription', () => {
      let unsubscribed = false;

      const obj = {
        [Symbol.observable]() {
          return {
            subscribe() {
              return {
                unsubscribe() {
                  unsubscribed = true;
                }
              }
            }
          };
        }
      };

      const sub = from(obj).subscribe();
      expect(unsubscribed).to.be.false;
      sub.unsubscribe();
      expect(unsubscribed).to.be.true;
    });
  });

  describe('from(asyncIterable)', () => {
    let _original: any;

    before(() => {
      let counter = 0;
      _original = Symbol && Symbol.asyncIterator;
      Symbol = Symbol || function (desc: string ) { return '' + (counter++); } as any;
      (Symbol as any).asyncIterator = (Symbol as any).asyncIterator || symbolAsyncIterator;
    });

    after(() => {
      (Symbol as any).asyncIterator = _original;
    });

    it('should convert an asyncIterable', (done: MochaDone) => {
      const results: any[] = [];

      async function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }

      from(gen()).subscribe({
        next(value) { results.push(value); },
        complete() {
          expect(results).to.deep.equal([1, 2, 3]);
          done();
        },
      });
    });
  });
});
