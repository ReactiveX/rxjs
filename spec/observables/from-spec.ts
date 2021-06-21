import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { asyncScheduler, of, from, Observer, observable, Subject, noop, Subscription } from 'rxjs';
import { first, concatMap, delay, take, tap } from 'rxjs/operators';
import { ReadableStream } from 'web-streams-polyfill';

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

  it('should finalize an AsyncGenerator', (done) => {
    const results: any[] = [];
    const sideEffects: any[] = [];

    async function* gen() {
      try {
        let i = 0;
        while (true) {
          sideEffects.push(i);
          yield await i++;
        }
      } finally {
        results.push('finalized generator');
      }
    }

    const source = from(gen()).pipe(
      take(3),
    );


    source.subscribe({
      next: value => results.push(value),
      complete: () => {
        results.push('done');
        setTimeout(() => {
          expect(sideEffects).to.deep.equal([0, 1, 2]);
          expect(results).to.deep.equal([0, 1, 2, 'done', 'finalized generator']);
          done();
        });
      }
    });
  });

  it('should finalize an AsyncGenerator on error', (done) => {
    const results: any[] = [];
    const sideEffects: any[] = [];

    async function* gen() {
      try {
        let i = 0;
        while (true) {
          sideEffects.push(i);
          yield await i++;
        }
      } finally {
        results.push('finalized generator');
      }
    }

    const source = from(gen()).pipe(
      tap({
        next: value => {
          if (value === 2) {
            throw new Error('weee');
          }
        }
      }),
    );


    source.subscribe({
      next: value => results.push(value),
      error: () => {
        results.push('in error');
        setTimeout(() => {
          expect(sideEffects).to.deep.equal([0, 1, 2]);
          expect(results).to.deep.equal([0, 1, 'in error', 'finalized generator']);
          done();
        });
      }
    });
  });

  it('should finalize an AsyncGenerator on unsubscribe', (done) => {
    const results: any[] = [];
    const sideEffects: any[] = [];
    let subscription: Subscription;

    async function* gen() {
      try {
        let i = 0;
        while (true) {
          sideEffects.push(i);
          yield await i++;
          if (i === 2) {
            subscription.unsubscribe();
          }
        }
      } finally {
        results.push('finalized generator');
        expect(sideEffects).to.deep.equal([0, 1, 2]);
        expect(results).to.deep.equal([0, 1, 'finalized generator']);
        done();
      }
    }

    const source = from(gen());

    subscription = source.subscribe(value => results.push(value));
  });


  it('should finalize a generator', () => {
    const results: any[] = [];

    function* gen() {
      try {
        let i = 0;
        while (true) {
          yield i++;
        }
      } finally {
        results.push('finalized generator');
      }
    }

    const source = from(gen()).pipe(
      take(3),
    );


    source.subscribe({
      next: value => results.push(value),
      complete: () => results.push('done')
    });

    expect(results).to.deep.equal([0, 1, 2, 'done', 'finalized generator']);
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
  const sources: Array<{ name: string, createValue: () => any }> = [
    { name: 'observable', createValue: () => of('x') },
    { name: 'observable-like', createValue: () => fakervable('x') },
    { name: 'observable-like-array', createValue: () => fakeArrayObservable('x') },
    { name: 'array', createValue: () => ['x'] },
    { name: 'promise', createValue: () => Promise.resolve('x') },
    { name: 'iterator', createValue: () => fakerator('x') },
    { name: 'array-like', createValue: () => ({ [0]: 'x', length: 1 }) },
    // ReadableStreams are not lazy, so we have to have this createValue() thunk
    // so that each tests gets a new one.
    { name: 'readable-stream-like', createValue: () => new ReadableStream({
      pull(controller) {
        controller.enqueue('x');
        controller.close();
      },
    })},
    { name: 'string', createValue: () => 'x'},
    { name: 'arguments', createValue: () => getArguments('x') },
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
      createValue: () => fakeAsyncIterator('x')
    });
  }

  for (const source of sources) {
    it(`should accept ${source.name}`, (done) => {
      let nextInvoked = false;
      from(source.createValue())
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
      from(source.createValue(), asyncScheduler)
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

  it('should support ReadableStream-like objects', (done) => {
    const input = [0, 1, 2];
    const output: number[] = [];

    const readableStream = new ReadableStream({
      pull(controller) {
        if (input.length > 0) {
          controller.enqueue(input.shift());

          if (input.length === 0) {
            controller.close();
          }
        }
      },
    });

    from(readableStream).subscribe({
      next: value => {
        output.push(value);
        expect(readableStream.locked).to.equal(true);
      },
      complete: () => {
        expect(output).to.deep.equal([0, 1, 2]);
        expect(readableStream.locked).to.equal(false);
        done();
      }
    });
  });

  it('should lock and release ReadableStream-like objects', (done) => {
    const input = [0, 1, 2];
    const output: number[] = [];

    const readableStream = new ReadableStream({
      pull(controller) {
        if (input.length > 0) {
          controller.enqueue(input.shift());

          if (input.length === 0) {
            controller.close();
          }
        }
      },
    });

    from(readableStream).subscribe({
      next: value => {
        output.push(value);
        expect(readableStream.locked).to.equal(true);
      },
      complete: () => {
        expect(output).to.deep.equal([0, 1, 2]);
        expect(readableStream.locked).to.equal(false);
        done();
      }
    });
  });
});
