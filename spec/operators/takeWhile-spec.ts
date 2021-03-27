/** @prettier */
import { expect } from 'chai';
import { takeWhile, tap, mergeMap } from 'rxjs/operators';
import { of, Observable, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {takeWhile} */
describe('takeWhile', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should take all elements until predicate is false', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-1-^2--3--4--5--6--|');
      const e1subs = '   ^------!         ';
      const expected = ' -2--3--|         ';

      const result = e1.pipe(takeWhile((v) => +v < 4));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take all elements with predicate returns true', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------------!';
      const expected = '  --b--c--d--e--|';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take all elements with truthy predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------------!';
      const expected = '  --b--c--d--e--|';

      const result = e1.pipe(
        takeWhile(<any>(() => {
          return {};
        }))
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip all elements with predicate returns false', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-!            ';
      const expected = '  --|            ';

      const result = e1.pipe(takeWhile(() => false));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip all elements with falsy predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-!            ';
      const expected = '  --|            ';

      const result = e1.pipe(takeWhile(() => null as any));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take all elements until predicate return false', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--|      ';

      function predicate(value: string) {
        return value !== 'd';
      }

      const result = e1.pipe(takeWhile(predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take all elements up to and including the element that made the predicate return false', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--(d|)   ';

      function predicate(value: string) {
        return value !== 'd';
      }
      const inclusive = true;

      const result = e1.pipe(takeWhile(predicate, inclusive));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take elements with predicate when source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--');
      const e1subs = '    ^-------------';
      const expected = '  --b--c--d--e--';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete when source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^------------|');
      const e1subs = '    ^------------!';
      const expected = '  -------------|';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should pass element index to predicate', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--|      ';

      function predicate(value: string, index: number) {
        return index < 2;
      }

      const result = e1.pipe(takeWhile(predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--#');
      const e1subs = '    ^-------------!';
      const expected = '  --b--c--d--e--#';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should invoke predicate until return false', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-------!      ';
      const expected = '  --b--c--|      ';

      let invoked = 0;
      function predicate(value: string) {
        invoked++;
        return value !== 'd';
      }

      const result = e1.pipe(
        takeWhile(predicate),
        tap(null, null, () => {
          expect(invoked).to.equal(3);
        })
      );
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if predicate throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs = '    ^-!            ';
      const expected = '  --#            ';

      function predicate(value: string) {
        throw 'error';
      }

      const result = e1.pipe(takeWhile(<any>predicate));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take elements until unsubscribed', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const unsub = '     -----!         ';
      const e1subs = '    ^----!         ';
      const expected = '  --b---         ';

      function predicate(value: string) {
        return value !== 'd';
      }

      const result = e1.pipe(takeWhile(predicate));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const unsub = '     -----!         ';
      const e1subs = '    ^----!         ';
      const expected = '  --b---         ';

      function predicate(value: string) {
        return value !== 'd';
      }

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        takeWhile(predicate),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support type guards without breaking previous behavior', () => {
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

      const foo: Foo = new Foo();
      of(foo)
        .pipe(takeWhile((foo) => foo.baz === 42))
        .subscribe((x) => x.baz); // x is still Foo
      of(foo)
        .pipe(takeWhile(isBar))
        .subscribe((x) => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is interface, not the class
      of(foobar)
        .pipe(takeWhile((foobar) => foobar.bar === 'name'))
        .subscribe((x) => x.bar); // <-- x is still Bar
      of(foobar)
        .pipe(takeWhile(isBar))
        .subscribe((x) => x.bar); // <--- x is Bar!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      of(barish)
        .pipe(takeWhile((x) => x.bar === 'quack'))
        .subscribe((x) => x.bar); // x is still { bar: string; baz: number; }
      of(barish)
        .pipe(takeWhile(isBar))
        .subscribe((bar) => bar.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Observable<string | number> = from([1, 'aaa', 3, 'bb']);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      xs.pipe(takeWhile(isString)).subscribe((s) => s.length); // s is string

      // In contrast, this type of regular boolean predicate still maintains the original type
      xs.pipe(takeWhile((x) => typeof x === 'number')).subscribe((x) => x); // x is still string | number
      xs.pipe(takeWhile((x, i) => typeof x === 'number' && x > i)).subscribe((x) => x); // x is still string | number
    }
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

    synchronousObservable.pipe(takeWhile((value) => value < 2)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
