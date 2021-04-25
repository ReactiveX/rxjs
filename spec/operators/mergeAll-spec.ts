/** @prettier */
import { expect } from 'chai';
import { mergeAll, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { throwError, from, of, queueScheduler, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {mergeAll} */
describe('mergeAll', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should merge a hot observable of cold observables', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    --a---b--c---d--|      ');
      const xsubs = '   --^---------------!      ';
      const y = cold('           ----e---f--g---|');
      const ysubs = '   ---------^--------------!';
      const e1 = hot('  --x------y-------|       ', { x: x, y: y });
      const e1subs = '  ^----------------!       ';
      const expected = '----a---b--c-e-d-f--g---|';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge all observables in an observable', () => {
    testScheduler.run(({ expectObservable }) => {
      // prettier-ignore
      const e1 = from([
        of('a'),
        of('b'),
        of('c')
      ]);
      const expected = '(abc|)';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
    });
  });

  it('should throw if any child observable throws', () => {
    testScheduler.run(({ expectObservable }) => {
      // prettier-ignore
      const e1 = from([
        of('a'),
        throwError(() => ('error')),
        of('c')
      ]);
      const expected = '(a#)';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
    });
  });

  it('should handle merging a hot observable of observables', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a---b---c---|   ');
      const xsubs = '   --^-----------!   ';
      const y = cold('       d---e---f---|');
      const ysubs = '   -----^-----------!';
      const e1 = hot('  --x--y--|         ', { x: x, y: y });
      const e1subs = '  ^-------!         ';
      const expected = '--a--db--ec--f---|';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge one cold Observable at a time with parameter concurrency=1', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a---b---c---|            ');
      const xsubs = '   --^-----------!            ';
      const y = cold('                d---e---f---|');
      const ysubs = '   --------------^-----------!';
      const e1 = hot('  --x--y--|                  ', { x: x, y: y });
      const e1subs = '  ^-------!                  ';
      const expected = '--a---b---c---d---e---f---|';

      expectObservable(e1.pipe(mergeAll(1))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge two cold Observables at a time with parameter concurrency=2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a---b---c---|        ');
      const xsubs = '   --^-----------!        ';
      const y = cold('       d---e---f---|     ');
      const ysubs = '   -----^-----------!     ';
      const z = cold('                --g---h-|');
      const zsubs = '   --------------^-------!';
      const e1 = hot('  --x--y--z--|           ', { x: x, y: y, z: z });
      const e1subs = '  ^----------!           ';
      const expected = '--a--db--ec--f--g---h-|';

      expectObservable(e1.pipe(mergeAll(2))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge one hot Observable at a time with parameter concurrency=1', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   ---a---b---c---|          ');
      const xsubs = '   --^------------!          ';
      const y = hot('   -------------d---e---f---|');
      const ysubs = '   ---------------^---------!';
      const e1 = hot('  --x--y--|                 ', { x: x, y: y });
      const e1subs = '  ^-------!                 ';
      const expected = '---a---b---c-----e---f---|';

      expectObservable(e1.pipe(mergeAll(1))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge two hot Observables at a time with parameter concurrency=2', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   i--a---b---c---|        ');
      const xsubs = '   --^------------!        ';
      const y = hot('   -i-i--d---e---f---|     ');
      const ysubs = '   -----^------------!     ';
      const z = hot('   --i--i--i--i-----g---h-|');
      const zsubs = '   ---------------^-------!';
      const e1 = hot('  --x--y--z--|            ', { x: x, y: y, z: z });
      const e1subs = '  ^----------!            ';
      const expected = '---a--db--ec--f--g---h-|';

      expectObservable(e1.pipe(mergeAll(2))).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle merging a hot observable of observables, outer unsubscribed early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a---b---c---|   ');
      const xsubs = '   --^---------!     ';
      const y = cold('       d---e---f---|');
      const ysubs = '   -----^------!     ';
      const e1 = hot('  --x--y--|         ', { x: x, y: y });
      const e1subs = '  ^-------!         ';
      const expected = '--a--db--ec--     ';
      const unsub = '   ------------!     ';

      expectObservable(e1.pipe(mergeAll()), unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a---b---c---|   ');
      const xsubs = '   --^---------!     ';
      const y = cold('       d---e---f---|');
      const ysubs = '   -----^------!     ';
      const e1 = hot('  --x--y--|         ', { x: x, y: y });
      const e1subs = '  ^-------!         ';
      const expected = '--a--db--ec--     ';
      const unsub = '   ------------!     ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        mergeAll(),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge parallel emissions', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    ----a----b----c---|');
      const xsubs = '   --^-----------------!';
      const y = cold('       -d----e----f---|');
      const ysubs = '   -----^--------------!';
      const e1 = hot('  --x--y--|            ', { x: x, y: y });
      const e1subs = '  ^-------!            ';
      const expected = '------(ad)-(be)-(cf)|';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge empty and empty', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    |      ');
      const xsubs = '   --(^!)   ';
      const y = cold('       |   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^-------!';
      const expected = '--------|';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge three empties', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    |         ');
      const xsubs = '   --(^!)      ';
      const y = cold('       |      ');
      const ysubs = '   -----(^!)   ';
      const z = cold('         |    ');
      const zsubs = '   -------(^!) ';
      const e1 = hot('  --x--y-z---|', { x: x, y: y, z: z });
      const e1subs = '  ^----------!';
      const expected = '-----------|';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge never and empty', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    -      ');
      const xsubs = '   --^      ';
      const y = cold('       |   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^-------!';
      const expected = '---------';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge never and never', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    -      ');
      const xsubs = '   --^      ';
      const y = cold('       -   ');
      const ysubs = '   -----^   ';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^-------!';
      const expected = '---------';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge empty and throw', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    |      ');
      const xsubs = '   --(^!)   ';
      const y = cold('       #   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^----!   ';
      const expected = '-----#   ';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge never and throw', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    -      ');
      const xsubs = '   --^--!   ';
      const y = cold('       #   ');
      const ysubs = '   -----(^!)';
      const e1 = hot('  --x--y--|', { x: x, y: y });
      const e1subs = '  ^----!   ';
      const expected = '-----#   ';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge empty and eventual error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    |         ');
      const xsubs = '   --(^!)      ';
      const y = cold('       ------#');
      const ysubs = '   -----^-----!';
      const e1 = hot('  --x--y--|   ', { x: x, y: y });
      const e1subs = '  ^-------!   ';
      const expected = '-----------#';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge never and eventual error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    -         ');
      const xsubs = '   --^--------!';
      const y = cold('       ------#');
      const ysubs = '   -----^-----!';
      const e1 = hot('  --x--y--|   ', { x: x, y: y });
      const e1subs = '  ^-------!   ';
      const expected = '-----------#';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take an empty source and return empty too', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take a never source and return never too', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take a throw source and return throw too', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle merging a hot observable of non-overlapped observables', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a-b---------|                 ');
      const xsubs = '   --^-----------!                 ';
      const y = cold('              c-d-e-f-|           ');
      const ysubs = '   ------------^-------!           ';
      const z = cold('                       g-h-i-j-k-|');
      const zsubs = '   ---------------------^---------!';
      const e1 = hot('  --x---------y--------z--------| ', { x: x, y: y, z: z });
      const e1subs = '  ^-----------------------------! ';
      const expected = '--a-b-------c-d-e-f--g-h-i-j-k-|';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if inner observable raises error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a-b---------|                 ');
      const xsubs = '   --^-----------!                 ';
      const y = cold('              c-d-e-f-#           ');
      const ysubs = '   ------------^-------!           ';
      const z = cold('                       g-h-i-j-k-|');
      const zsubs: string[] = [];
      const e1 = hot('  --x---------y--------z--------| ', { x: x, y: y, z: z });
      const e1subs = '  ^-------------------!           ';
      const expected = '--a-b-------c-d-e-f-#           ';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if outer observable raises error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('    a-b---------|      ');
      const xsubs = '   --^-----------!      ';
      const y = cold('              c-d-e-f-|');
      const ysubs = '   ------------^---!    ';
      const e1 = hot('  --x---------y---#    ', { x: x, y: y });
      const e1subs = '  ^---------------!    ';
      const expected = '--a-b-------c-d-#    ';

      expectObservable(e1.pipe(mergeAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should merge all promises in an observable', (done) => {
    const e1 = from([
      new Promise<string>((res) => {
        res('a');
      }),
      new Promise<string>((res) => {
        res('b');
      }),
      new Promise<string>((res) => {
        res('c');
      }),
      new Promise<string>((res) => {
        res('d');
      }),
    ]);
    const expected = ['a', 'b', 'c', 'd'];

    const res: string[] = [];
    e1.pipe(mergeAll()).subscribe(
      (x) => {
        res.push(x);
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        expect(res).to.deep.equal(expected);
        done();
      }
    );
  });

  it('should raise error when promise rejects', (done) => {
    const error = 'error';
    const e1 = from([
      new Promise<string>((res) => {
        res('a');
      }),
      new Promise<string>((res: any, rej) => {
        rej(error);
      }),
      new Promise<string>((res) => {
        res('c');
      }),
      new Promise<string>((res) => {
        res('d');
      }),
    ]);

    const res: string[] = [];
    e1.pipe(mergeAll()).subscribe(
      (x) => {
        res.push(x);
      },
      (err) => {
        expect(res.length).to.equal(1);
        expect(err).to.equal('error');
        done();
      },
      () => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should finalize generators when merged if the subscription ends', () => {
    const iterable = {
      finalized: false,
      next() {
        return { value: 'duck', done: false };
      },
      return() {
        this.finalized = true;
      },
      [Symbol.iterator]() {
        return this;
      },
    };

    const results: string[] = [];

    const iterableObservable = from<string>(iterable as any);
    of(iterableObservable)
      .pipe(mergeAll(), take(3))
      .subscribe(
        (x) => results.push(x),
        null,
        () => results.push('GOOSE!')
      );

    expect(results).to.deep.equal(['duck', 'duck', 'duck', 'GOOSE!']);
    expect(iterable.finalized).to.be.true;
  });

  it('should merge two observables', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    of(a, b)
      .pipe(mergeAll())
      .subscribe(
        (val) => {
          expect(val).to.equal(r.shift());
        },
        null,
        done
      );
  });

  it('should merge two immediately-scheduled observables', (done) => {
    const a = of(1, 2, 3, queueScheduler);
    const b = of(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    of(a, b, queueScheduler)
      .pipe(mergeAll())
      .subscribe(
        (val) => {
          expect(val).to.equal(r.shift());
        },
        null,
        done
      );
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    of(synchronousObservable)
      .pipe(mergeAll(), take(3))
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
