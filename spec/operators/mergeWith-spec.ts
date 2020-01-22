import { expect } from 'chai';
import { mergeWith, map, mergeAll } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { queueScheduler, of } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {merge} */
describe('merge operator', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should handle merging two hot observables', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----b-----c----|');
      const e1subs = '  ^------------------!';
      const e2 = hot('-----d-----e-----f---|');
      const e2subs = '  ^--------------------!';
      const expected = '--a--d--b--e--c--f---|';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge a source with a second', done => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    a.pipe(mergeWith(b)).subscribe(
      val => {
        expect(val).to.equal(r.shift());
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );
  });

  it('should merge cold and cold', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|');
      const e1subs = '  ^-------------------!';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^----------------------!';
      const expected = '---a--x--b--y--c--z----|';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge hot and hot', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a---^-b-----c----|');
      const e1subs = '       ^------------!';
      const e2 = hot('-----x-^----y-----z----|');
      const e2subs = '       ^---------------!';
      const expected = '     --b--y--c--z----|';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge hot and cold', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---a-^---b-----c----|');
      const e1subs = '     ^--------------!';
      const e2 = cold('    --x-----y-----z----|');
      const e2subs = '     ^------------------!';
      const expected = '   --x-b---y-c---z----|';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge parallel emissions', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a----b----c----|');
      const e1subs = '  ^-----------------!';
      const e2 = hot('  ---x----y----z----|');
      const e2subs = '  ^-----------------!';
      const expected = '---(ax)-(by)-(cz)-|';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----b-----c----|  ');
      const e1subs = '  ^---------!           ';
      const e2 = hot('  -----d-----e-----f---|');
      const e2subs = '  ^---------!           ';
      const expected = '--a--d--b--           ';
      const unsub = '   ----------!           ';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a-----b-----c----|  ');
      const e1subs = '  ^---------!           ';
      const e2 = hot('  -----d-----e-----f---|');
      const e2subs = '  ^---------!           ';
      const expected = '--a--d--b--           ';
      const unsub = '   ----------!           ';

      const result = e1.pipe(
        map(x => x),
        mergeWith(e2),
        map(x => x)
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge empty and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|   ');
      const e1subs = ' (^!)';
      const e2 = cold('|   ');
      const e2subs = ' (^!)';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe('|');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge three empties', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = ' (^!)';
      const e2 = cold('|');
      const e2subs = ' (^!)';
      const e3 = cold('|');
      const e3subs = ' (^!)';

      const result = e1.pipe(mergeWith(e2, e3));

      expectObservable(result).toBe('|');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });

  it('should merge never and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = ' ^';
      const e2 = cold('|');
      const e2subs = ' (^!)';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe('-');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge never and never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = ' ^';
      const e2 = cold('-');
      const e2subs = ' ^';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe('-');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge empty and throw', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|');
      const e1subs = ' (^!)';
      const e2 = cold('#');
      const e2subs = ' (^!)';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe('#');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge hot and throw', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot(' --a--b--c--|');
      const e1subs = '(^!)';
      const e2 = cold('#');
      const e2subs = '(^!)';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe('#');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge never and throw', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-');
      const e1subs = ' (^!)';
      const e2 = cold('#');
      const e2subs = ' (^!)';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe('#');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge empty and eventual error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)    ';
      const e2 = hot('  -------#');
      const e2subs = '  ^------!';
      const expected = '-------#';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge hot and error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^------!    ';
      const e2 = hot('  -------#    ');
      const e2subs = '  ^------!    ';
      const expected = '--a--b-#    ';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should merge never and error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------');
      const e1subs = '  ^------!';
      const e2 = hot('  -------#');
      const e2subs = '  ^------!';
      const expected = '-------#';

      const result = e1.pipe(mergeWith(e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});

describe('mergeAll operator', () => {
  it('should merge two observables', done => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    of(a, b)
      .pipe(mergeAll())
      .subscribe(
        val => {
          expect(val).to.equal(r.shift());
        },
        null,
        done
      );
  });

  it('should merge two immediately-scheduled observables', done => {
    const a = of(1, 2, 3, queueScheduler);
    const b = of(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    of(a, b, queueScheduler)
      .pipe(mergeAll())
      .subscribe(
        val => {
          expect(val).to.equal(r.shift());
        },
        null,
        done
      );
  });
});
