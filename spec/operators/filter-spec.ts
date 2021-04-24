/** @prettier */
import { expect } from 'chai';
import { filter, tap, map, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable, from } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {filter} */
describe('filter', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  function oddFilter(x: number | string) {
    return +x % 2 === 1;
  }

  function isPrime(i: number | string) {
    if (+i <= 1) {
      return false;
    }
    const max = Math.floor(Math.sqrt(+i));
    for (let j = 2; j <= max; ++j) {
      if (+i % j === 0) {
        return false;
      }
    }
    return true;
  }

  it('should filter out even values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --0--1--2--3--4--|');
      const e1subs = '  ^----------------!';
      const expected = '-----1-----3-----|';

      expectObservable(e1.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3---5----7-------|';

      expectObservable(e1.pipe(filter(isPrime))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter with an always-true predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3-4-5-6--7-8--9--|';

      const predicate = () => {
        return true;
      };

      expectObservable(e1.pipe(filter(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter with an always-false predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     -------------------|';

      const predicate = () => {
        return false;
      };

      expectObservable(e1.pipe(filter(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, source unsubscribes early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-----------!       ';
      const expected = '     --3---5----7-       ';
      const unsub = '        ------------!       ';

      expectObservable(e1.pipe(filter(isPrime)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, source throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--#');
      const e1subs = '       ^------------------!';
      const expected = '     --3---5----7-------#';

      expectObservable(e1.pipe(filter(isPrime))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, but predicate throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-------!           ';
      const expected = '     --3---5-#           ';

      let invoked = 0;
      function predicate(x: any) {
        invoked++;
        if (invoked === 4) {
          throw 'error';
        }
        return isPrime(x);
      }

      expectObservable(e1.pipe(filter(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, predicate with index', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3--------7-------|';

      function predicate(x: any, i: number) {
        return isPrime(+x + i * 10);
      }

      expectObservable(e1.pipe(filter(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should invoke predicate once for each checked value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --3---5----7-------|';

      let invoked = 0;
      const predicate = (x: any) => {
        invoked++;
        return isPrime(x);
      };

      const result = e1.pipe(
        filter(predicate),
        tap(null, null, () => {
          expect(invoked).to.equal(7);
        })
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, predicate with index, source unsubscribes early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-----------!       ';
      const expected = '     --3--------7-       ';
      const unsub = '        ------------!       ';

      function predicate(x: any, i: number) {
        return isPrime(+x + i * 10);
      }

      expectObservable(e1.pipe(filter(predicate)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, predicate with index, source throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--#');
      const e1subs = '       ^------------------!';
      const expected = '     --3--------7-------#';

      function predicate(x: any, i: number) {
        return isPrime(+x + i * 10);
      }

      expectObservable(e1.pipe(filter(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should filter in only prime numbers, predicate with index and throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-------!           ';
      const expected = '     --3-----#           ';

      let invoked = 0;
      function predicate(x: any, i: number) {
        invoked++;
        if (invoked === 4) {
          throw 'error';
        }
        return isPrime(+x + i * 10);
      }

      expectObservable(e1.pipe(filter(predicate))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should compose with another filter to allow multiples of six', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --------6----------|';

      const result = e1.pipe(
        filter((x: string) => +x % 2 === 0),
        filter((x: string) => +x % 3 === 0)
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be able to accept and use a thisArg', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     --------6----------|';

      class Filterer {
        filter1 = (x: string) => +x % 2 === 0;
        filter2 = (x: string) => +x % 3 === 0;
      }

      const filterer = new Filterer();

      const result = e1.pipe(
        filter(function (this: any, x) {
          return this.filter1(x);
        }, filterer),
        filter(function (this: any, x) {
          return this.filter2(x);
        }, filterer),
        filter(function (this: any, x) {
          return this.filter1(x);
        }, filterer)
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be able to use filter and map composed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^------------------!';
      const expected = '     ----a---b----c-----|';
      const values = { a: 16, b: 36, c: 64 };

      const result = e1.pipe(
        filter((x: string) => +x % 2 === 0),
        map((x: string) => +x * +x)
      );

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from the source', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --0--1--2--3--4--#');
      const e1subs = '  ^----------------!';
      const expected = '-----1-----3-----#';

      expectObservable(e1.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(filter(oddFilter))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should send errors down the error path', (done) => {
    of(42)
      .pipe(
        filter((x: number, index: number): boolean => {
          throw 'bad';
        })
      )
      .subscribe(
        (x: number) => {
          done(new Error('should not be called'));
        },
        (err: any) => {
          expect(err).to.equal('bad');
          done();
        },
        () => {
          done(new Error('should not be called'));
        }
      );
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1--2--^-3-4-5-6--7-8--9--|');
      const e1subs = '       ^-----------!       ';
      const expected = '     --3---5----7-       ';
      const unsub = '        ------------!       ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        filter(isPrime),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support type guards without breaking previous behavior', () => {
    // tslint:disable no-unused-variable

    // type guards with interfaces and classes
    {
      interface Bar {
        bar?: string;
      }
      interface Baz {
        baz?: number;
      }
      class Foo implements Bar, Baz {
        constructor(public bar: string = 'name', public baz: number = 42) {}
      }

      const isBar = (x: any): x is Bar => x && (<Bar>x).bar !== undefined;
      const isBaz = (x: any): x is Baz => x && (<Baz>x).baz !== undefined;

      const foo: Foo = new Foo();
      of(foo)
        .pipe(filter((foo) => foo.baz === 42))
        .subscribe((x) => x.baz); // x is still Foo
      of(foo)
        .pipe(filter(isBar))
        .subscribe((x) => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is interface, not the class
      of(foobar)
        .pipe(filter((foobar) => foobar.bar === 'name'))
        .subscribe((x) => x.bar); // <-- x is still Bar
      of(foobar)
        .pipe(filter(isBar))
        .subscribe((x) => x.bar); // <--- x is Bar!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      of(barish)
        .pipe(filter((x) => x.bar === 'quack'))
        .subscribe((x) => x.bar); // x is still { bar: string; baz: number; }
      of(barish)
        .pipe(filter(isBar))
        .subscribe((bar) => bar.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Observable<string | number> = from([1, 'aaa', 3, 'bb']);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      xs.pipe(filter(isString)).subscribe((s) => s.length); // s is string

      // In contrast, this type of regular boolean predicate still maintains the original type
      xs.pipe(filter((x) => typeof x === 'number')).subscribe((x) => x); // x is still string | number
      xs.pipe(filter((x, i) => typeof x === 'number' && x > i)).subscribe((x) => x); // x is still string | number
    }

    // tslint:disable enable
  });

  it('should support Boolean as a predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { t: 1, f: 0 };
      const e1 = hot('-t--f--^-t-f-t-f--t-f--f--|', values);
      const e1subs = '       ^------------------!';
      const expected = '     --t---t----t-------|';

      expectObservable(e1.pipe(filter(Boolean))).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
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

    synchronousObservable
      .pipe(
        filter(() => true),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
