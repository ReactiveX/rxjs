import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { asyncScheduler, of, from, Observer, observable, Subject, noop } from 'rxjs';
import { first, concatMap, delay } from 'rxjs/operators';

// tslint:disable:no-any
declare const expectObservable: any;
declare const rxTestScheduler: TestScheduler;
// tslint:enable:no-any

function getArguments<T>(...args: T[]) {
  return arguments;
}

/** @test {from} */
describe('from', () => {
  it('should create an observable from an array', () => {
    const e1 = from([10, 20, 30]).pipe(
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      concatMap((x, i) => of(x).pipe(
        delay(i === 0 ? 0 : 20, rxTestScheduler))
      )
    );
    const expected = 'x-y-(z|)';
    expectObservable(e1).toBe(expected, {x: 10, y: 20, z: 30});
  });

  it('should throw for non observable object', () => {
    const r = () => {
      // tslint:disable-next-line:no-any needed for the test
      from({} as any).subscribe();
    };

    expect(r).to.throw();
  });

  const fakervable = <T>(...values: T[]) => ({
    [observable]: () => ({
      subscribe: (observer: Observer<T>) => {
        for (const value of values) {
          observer.next(value);
        }
        observer.complete();
      }
    })
  });

  const fakeArrayObservable = <T>(...values: T[]) => {
    let arr: any = ['bad array!'];
    arr[observable] = () =>  {
      return {
        subscribe: (observer: Observer<T>) => {
          for (const value of values) {
            observer.next(value);
          }
          observer.complete();
        }
      };
    };
    return arr;
  };

  const fakerator = <T>(...values: T[]) => ({
    [Symbol.iterator as symbol]: () => {
      const clone = [...values];
      return {
        next: () => ({
          done: clone.length <= 0,
          value: clone.shift()
        })
      };
    }
  });

  // tslint:disable-next-line:no-any it's silly to define all of these types.
  const sources: Array<{ name: string, value: any }> = [
    { name: 'observable', value: of('x') },
    { name: 'observable-like', value: fakervable('x') },
    { name: 'observable-like-array', value: fakeArrayObservable('x') },
    { name: 'array', value: ['x'] },
    { name: 'promise', value: Promise.resolve('x') },
    { name: 'iterator', value: fakerator('x') },
    { name: 'array-like', value: { [0]: 'x', length: 1 }},
    { name: 'string', value: 'x'},
    { name: 'arguments', value: getArguments('x') },
  ];

  if (Symbol && Symbol.asyncIterator) {
    const fakeAsyncIterator = (...values: any[]) => {
      return {
        [Symbol.asyncIterator]() {
          let i = 0;
          return {
            next() {
              const index = i++;
              if (index < values.length) {
                return Promise.resolve({ done: false, value: values[index] });
              } else {
                return Promise.resolve({ done: true });
              }
            },
            [Symbol.asyncIterator]() {
              return this;
            }
          };
        }
      };
    };

    sources.push({
      name: 'async-iterator',
      value: fakeAsyncIterator('x')
    });
  }

  for (const source of sources) {
    it(`should accept ${source.name}`, (done) => {
      let nextInvoked = false;
      from(source.value)
        .subscribe(
          (x) => {
            nextInvoked = true;
            expect(x).to.equal('x');
          },
          (x) => {
            done(new Error('should not be called'));
          },
          () => {
            expect(nextInvoked).to.equal(true);
            done();
          }
        );
    });
    it(`should accept ${source.name} and scheduler`, (done) => {
      let nextInvoked = false;
      from(source.value, asyncScheduler)
        .subscribe(
          (x) => {
            nextInvoked = true;
            expect(x).to.equal('x');
          },
          (x) => {
            done(new Error('should not be called'));
          },
          () => {
            expect(nextInvoked).to.equal(true);
            done();
          }
        );
      expect(nextInvoked).to.equal(false);
    });

    it(`should accept a function that implements [Symbol.observable]`, (done) => {
      const subject = new Subject<any>();
      const handler: any = (arg: any) => subject.next(arg);
      handler[observable] = () => subject;
      let nextInvoked = false;

      from((handler as any)).pipe(first()).subscribe(
        (x) => {
          nextInvoked = true;
          expect(x).to.equal('x');
        },
        (x) => {
          done(new Error('should not be called'));
        },
        () => {
          expect(nextInvoked).to.equal(true);
          done();
        }
      );
      handler('x');
    });

    it('should accept a thennable that happens to have a subscribe method', (done) => {
      // There was an issue with our old `isPromise` check that caused this to fail
      const input = Promise.resolve('test');
      (input as any).subscribe = noop;
      from(input).subscribe({
        next: x => {
          expect(x).to.equal('test');
          done();
        }
      })
    })
  }

  it('should appropriately handle errors from an iterator', () => {
    const erroringIterator = (function* () {
      for (let i = 0; i < 5; i++) {
        if (i === 3) {
          throw new Error('bad');
        }
        yield i;
      }
    })();

    const results: any[] = [];

    from(erroringIterator).subscribe({
      next: x => results.push(x),
      error: err => results.push(err.message)
    });

    expect(results).to.deep.equal([0, 1, 2, 'bad']);
  });

  it('should execute the finally block of a generator', () => {
    let finallyExecuted = false;
    const generator = (function* () {
      try {
        yield 'hi';
      } finally {
        finallyExecuted = true;
      }
    })();

    from(generator).subscribe();

    expect(finallyExecuted).to.be.true;
  });
});
