/** @prettier */
import { expect } from 'chai';
import { observableMatcher } from '../helpers/observableMatcher';
import { first, mergeMap, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, from, Observable, Subject, EmptyError } from 'rxjs';

/** @test {first} */
describe('first', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should take the first value of an observable with many values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--b--c---d---|');
      const e1subs = '  ^----!              ';
      const expected = '-----(a|)           ';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take the first value of an observable with one value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---(a|)');
      const e1subs = '  ^--!   ';
      const expected = '---(a|)';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow undefined as a default value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----a--a---a-|   ');
      const e1subs = '  ^-------------!   ';
      const expected = '--------------(U|)';

      expectObservable(e1.pipe(first((value) => value === 'b', undefined))).toBe(expected, { U: undefined });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should error on empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----#';

      expectObservable(e1.pipe(first())).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return the default value if source observable was empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-----^----|   ');
      const e1subs = '     ^----!   ';
      const expected = '   -----(a|)';

      expectObservable(e1.pipe(first(null, 'a'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should only emit one value in recursive cases', () => {
    const subject = new Subject<number>();
    const results: number[] = [];

    subject.pipe(first()).subscribe((x) => {
      results.push(x);
      subject.next(x + 1);
    });

    subject.next(0);

    expect(results).to.deep.equal([0]);
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---#');
      const e1subs = '   ^---!';
      const expected = ' ----#';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--^-------');
      const e1subs = '  ^-------';
      const expected = '--------';

      expectObservable(e1.pipe(first())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-----b----c---d--|');
      const e1subs = '     ^--!               ';
      const expected = '   ----               ';
      const unsub = '      ---!               ';

      expectObservable(e1.pipe(first()), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^-----b----c---d--|');
      const e1subs = '     ^--!               ';
      const expected = '   ----               ';
      const unsub = '      ---!               ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        first(),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe when the first value is received', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b---c-|');
      const e1subs = '  ^-!         ';
      const t = time('    --|       ');
      const expected = '----(a|)    ';

      const result = e1.pipe(first(), delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return first value that matches a predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const e1subs = '    ^-----!         ';
      const expected = '  ------(c|)      ';

      expectObservable(e1.pipe(first((value) => value === 'c'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return first value that matches a predicate for odd numbers', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const e1 = hot('--a-^--b--c--d--e--|', values);
      const e1subs = '    ^-----!         ';
      const expected = '  ------(c|)      ';

      expectObservable(e1.pipe(first((x) => x % 2 === 1))).toBe(expected, { c: 3 });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should error when no value matches the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const e1subs = '    ^--------------!';
      const expected = '  ---------------#';

      expectObservable(e1.pipe(first((x) => x === 's'))).toBe(expected, null, new EmptyError());
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return the default value when no value matches the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|   ');
      const e1subs = '    ^--------------!   ';
      const expected = '  ---------------(d|)';

      expectObservable(e1.pipe(first((x) => x === 's', 'd'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error when no value matches the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--#');
      const e1subs = '    ^-----------!';
      const expected = '  ------------#';

      expectObservable(e1.pipe(first((x) => x === 's'))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return first value that matches the index in the predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^--b--c--a--c--|');
      const e1subs = '    ^--------!      ';
      const expected = '  ---------(a|)   ';

      expectObservable(e1.pipe(first((_, i) => i === 2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const e1 = hot('--a-^--b--c--d--e--|', values);
      const e1subs = '    ^--------!      ';
      const expected = '  ---------#      ';

      const predicate = function (value: number) {
        if (value < 4) {
          return false;
        } else {
          throw 'error';
        }
      };

      expectObservable(e1.pipe(first(predicate))).toBe(expected, null, 'error');
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

      const isBar = (x: any): x is Bar => x && (x as Bar).bar !== undefined;
      const isBaz = (x: any): x is Baz => x && (x as Baz).baz !== undefined;

      const foo: Foo = new Foo();
      of(foo)
        .pipe(first())
        .subscribe((x) => x.baz); // x is Foo
      of(foo)
        .pipe(first((foo) => foo.bar === 'name'))
        .subscribe((x) => x.baz); // x is still Foo
      of(foo)
        .pipe(first(isBar))
        .subscribe((x) => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is the interface, not the class
      of(foobar)
        .pipe(first())
        .subscribe((x) => x.bar); // x is Bar
      of(foobar)
        .pipe(first((foobar) => foobar.bar === 'name'))
        .subscribe((x) => x.bar); // x is still Bar
      of(foobar)
        .pipe(first(isBaz))
        .subscribe((x) => x.baz); // x is Baz!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      of(barish)
        .pipe(first())
        .subscribe((x) => x.baz); // x is still { bar: string; baz: number; }
      of(barish)
        .pipe(first((x) => x.bar === 'quack'))
        .subscribe((x) => x.bar); // x is still { bar: string; baz: number; }
      of(barish)
        .pipe(first(isBar))
        .subscribe((x) => x.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Observable<string | number> = from([1, 'aaa', 3, 'bb']);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // missing predicate preserves the type
      xs.pipe(first()).subscribe((x) => x); // x is still string | number

      // null predicate preserves the type
      xs.pipe(first(null)).subscribe((x) => x); // x is still string | number

      // undefined predicate preserves the type
      xs.pipe(first(undefined)).subscribe((x) => x); // x is still string | number

      // After the type guard `first` predicates, the type is narrowed to string
      xs.pipe(first(isString)).subscribe((s) => s.length); // s is string

      // boolean predicates preserve the type
      xs.pipe(first((x) => typeof x === 'string')).subscribe((x) => x); // x is still string | number
    }

    // tslint:disable enable
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits, it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(first((value) => value === 2)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
