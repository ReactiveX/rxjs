import { of, from, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { filter, tap, map, mergeMap } from 'rxjs/operators';
import { expect } from 'chai';

describe('filter', () => {
  it('should filter values by a predicate', () => {
    const results: any[] = [];

    of(1, 2, 3, 4).pipe(
      filter(x => x !== 2),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 3, 4, 'done']);
  });

  it('should provide the index of the value emitted to the predicate', () => {
    const provided: Array<[string, number]> = [];

    of('a', 'b', 'c').pipe(
      filter((x, i) => {
        provided.push([x, i]);
        return true;
      }),
    )
    .subscribe();

    expect(provided).to.deep.equal([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
  });

  it('should propagate errors thrown in the predicate', () => {
    const results: any[] = [];
    let error: Error;

    of(1, 2, 3, 4).pipe(
      filter(x => {
        if (x === 3) throw new Error('Threes Company');
        return true;
      }),
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { error = err; },
      complete() { throw new Error('should not be called'); },
    });

    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('Threes Company');
    expect(results).to.deep.equal([1, 2]);
  });
});

declare function asDiagram(arg: string): Function;

/** @test {filter} */
describe('filter operator', () => {
  function oddFilter(x: number | string) {
    return (+x) % 2 === 1;
  }

  function isPrime(i: number | string) {
    if (+i <= 1) { return false; }
    const max = Math.floor(Math.sqrt(+i));
    for (let j = 2; j <= max; ++j) {
      if (+i % j === 0) { return false; }
    }
    return true;
  }

  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((a, b) => {
      expect(a).to.deep.equal(b);
    });
  })

  //asDiagram('filter(x => x % 2 === 1)')
  it('should filter out even values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--0--1--2--3--4--|');
      const subs =       '^                !';
      const expected =   '-----1-----3-----|';

      expectObservable(source.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter in only prime numbers', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^                  !';
      const expected =          '--3---5----7-------|';

      expectObservable(source.pipe(filter(isPrime))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter with an always-true predicate', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const expected =          '--3-4-5-6--7-8--9--|';
      const predicate = () => { return true; };

      expectObservable(source.pipe(filter(predicate))).toBe(expected);
    });
  });

  it('should filter with an always-false predicate', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const expected =          '-------------------|';
      const predicate = () => { return false; };

      expectObservable(source.pipe(filter(predicate))).toBe(expected);
    });
  });

  it('should filter in only prime numbers, source unsubscribes early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^           !       ';
      const unsub =             '            !       ';
      const expected =          '--3---5----7-       ';

      expectObservable(source.pipe(filter(isPrime)), unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter in only prime numbers, source throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--#');
      const subs =              '^                  !';
      const expected =          '--3---5----7-------#';

      expectObservable(source.pipe(filter(isPrime))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter in only prime numbers, but predicate throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^       !           ';
      const expected =          '--3---5-#           ';

      let invoked = 0;
      function predicate(x: any, index: number) {
        invoked++;
        if (invoked === 4) {
          throw 'error';
        }
        return isPrime(x);
      }

      expectObservable((<any>source).pipe(filter(predicate))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter in only prime numbers, predicate with index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^                  !';
      const expected =          '--3--------7-------|';

      function predicate(x: any, i: number) {
        return isPrime((+x) + i * 10);
      }

      expectObservable((<any>source).pipe(filter(predicate))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should invoke predicate once for each checked value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const expected =          '--3---5----7-------|';

      let invoked = 0;
      const predicate = (x: any) => {
        invoked++;
        return isPrime(x);
      };

      const r = source.pipe(
        filter(predicate),
        tap(null, null, () => {
          expect(invoked).to.equal(7);
        })
      );

      expectObservable(r).toBe(expected);
    });
  });

  it('should filter in only prime numbers, predicate with index, ' +
  'source unsubscribes early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^           !       ';
      const unsub =             '            !       ';
      const expected =          '--3--------7-       ';

      function predicate(x: any, i: number) {
        return isPrime((+x) + i * 10);
      }
      expectObservable((<any>source).pipe(filter(predicate)), unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter in only prime numbers, predicate with index, source throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--#');
      const subs =              '^                  !';
      const expected =          '--3--------7-------#';

      function predicate(x: any, i: number) {
        return isPrime((+x) + i * 10);
      }
      expectObservable((<any>source).pipe(filter(predicate))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should filter in only prime numbers, predicate with index and throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^       !           ';
      const expected =          '--3-----#           ';

      let invoked = 0;
      function predicate(x: any, i: number) {
        invoked++;
        if (invoked === 4) {
          throw 'error';
        }
        return isPrime((+x) + i * 10);
      }

      expectObservable((<any>source).pipe(filter(predicate))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should compose with another filter to allow multiples of six', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const expected =          '--------6----------|';

      expectObservable(
        source.pipe(
          filter((x: string) => (+x) % 2 === 0),
          filter((x: string) => (+x) % 3 === 0)
        )
      ).toBe(expected);
    });
  });

  // TODO: should filter allow "this arg"? I hope not. ewww
  // it('should be able to accept and use a thisArg', () => {
  //   testScheduler.run(({ hot, expectObservable }) => {
  //     const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
  //     const expected =          '--------6----------|';

  //     class Filterer {
  //       filter1 = (x: string) => (+x) % 2 === 0;
  //       filter2 = (x: string) => (+x) % 3 === 0;
  //     }

  //     const filterer = new Filterer();

  //     expectObservable(
  //       source.pipe(
  //         filter(function (this: any, x) { return this.filter1(x); }, filterer),
  //         filter(function (this: any, x) { return this.filter2(x); }, filterer),
  //         filter(function (this: any, x) { return this.filter1(x); }, filterer)
  //       )
  //     ).toBe(expected);
  //   });
  // });

  it('should be able to use filter and map composed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const expected =          '----a---b----c-----|';
      const values = { a: 16, b: 36, c: 64 };

      expectObservable(
        source.pipe(
          filter((x: string) => (+x) % 2 === 0),
          map((x: string) => (+x) * (+x))
        )
      ).toBe(expected, values);
    });
  });

  it('should propagate errors from the source', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--0--1--2--3--4--#');
      const subs =       '^                !';
      const expected =   '-----1-----3-----#';

      expectObservable(source.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should support Observable.empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('|');
      const subs =        '(^!)';
      const expected =    '|';

      expectObservable(source.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should support Observable.never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('-');
      const subs =        '^';
      const expected =    '-';

      expectObservable(source.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should support Observable.throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('#');
      const subs =        '(^!)';
      const expected =    '#';

      expectObservable(source.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should send errors down the error path', (done: MochaDone) => {
    of(42).pipe(
      filter(<any>((x: number, index: number) => {
        throw 'bad';
      }))
    ).subscribe((x: number) => {
        done(new Error('should not be called'));
      }, (err: any) => {
        expect(err).to.equal('bad');
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const subs =              '^           !       ';
      const unsub =             '            !       ';
      const expected =          '--3---5----7-       ';

      const r = source.pipe(
        mergeMap((x: any) => of(x)),
        filter(isPrime),
        mergeMap((x: any) => of(x))
      );

      expectObservable(r, unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });
});
