/** @prettier */
import { expect } from 'chai';
import { exhaustAll, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {exhaust} */
describe('exhaust', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should handle a hot observable of hot observables', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const x = hot('   -----a---b---c--|                  ');
      const xsubs = '   ------^---------!                  ';
      const y = hot('   -------d--e---f---|                ');
      const ysubs: string[] = [];
      const z = hot('   --------------g--h---i---|         ');
      const zsubs = '   --------------------^----!         ';
      const e1 = hot('  ------x-------y-----z-------------|', { x: x, y: y, z: z });
      const e1subs = '  ^---------------------------------!';
      const expected = '---------b---c-------i------------|';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
    });
  });

  it('should switch to first immediately-scheduled inner Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' (ab|)');
      const e1subs = '  (^!) ';
      const e2 = cold(' (cd|)');
      const e2subs: string[] = [];
      const expected = '(ab|)';

      expectObservable(of(e1, e2).pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a hot observable of observables', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|               ');
      const xsubs = '   ------^------------!               ';
      const y = cold('                ---d--e---f---|      ');
      const ysubs: string[] = [];
      const z = cold('                      ---g--h---i---|');
      const zsubs = '   --------------------^-------------!';
      const e1 = hot('  ------x-------y-----z-------------|', { x: x, y: y, z: z });
      const e1subs = '  ^---------------------------------!';
      const expected = '--------a---b---c------g--h---i---|';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
    });
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^---------!            ';
      const y = cold('                ---d--e---f---|');
      const ysubs: string[] = [];
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const unsub = '   ----------------!            ';
      const expected = '--------a---b----            ';

      expectObservable(e1.pipe(exhaustAll()), unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^---------!            ';
      const y = cold('                ---d--e---f---|');
      const ysubs: string[] = [];
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const unsub = '   ----------------!            ';
      const expected = '--------a---b----            ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        exhaustAll(),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, inner never completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('     --a---b--|              ');
      const xsubs = '   ---^--------!              ';
      const y = cold('         -d---e-             ');
      const ysubs: string[] = [];
      const z = cold('                ---f--g---h--');
      const zsubs = '   --------------^------------';
      const e1 = hot('  ---x---y------z----------| ', { x: x, y: y, z: z });
      const expected = '-----a---b-------f--g---h--';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
      expectSubscriptions(z.subscriptions).toBe(zsubs);
    });
  });

  it('should handle a synchronous switch and stay on the first inner observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|   ');
      const xsubs = '   ------^------------!   ';
      const y = cold('        ---d--e---f---|  ');
      const ysubs: string[] = [];
      const e1 = hot('  ------(xy)------------|', { x: x, y: y });
      const expected = '--------a---b---c-----|';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, one inner throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---#                ');
      const xsubs = '   ------^-----!                ';
      const y = cold('                ---d--e---f---|');
      const ysubs: string[] = [];
      const e1 = hot('  ------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---#                ';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, outer throws', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|         ');
      const xsubs = '   ------^------------!         ';
      const y = cold('                ---d--e---f---|');
      const ysubs: string[] = [];
      const e1 = hot('  ------x-------y-------#      ', { x: x, y: y });
      const expected = '--------a---b---c-----#      ';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
      expectSubscriptions(y.subscriptions).toBe(ysubs);
    });
  });

  it('should handle an empty hot observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ------|');
      const e1subs = '  ^-----!';
      const expected = '------|';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a never hot observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete not before the outer completes', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const x = cold('        --a---b---c--|   ');
      const xsubs = '   ------^------------!   ';
      const e1 = hot('  ------x---------------|', { x: x });
      const expected = '--------a---b---c-----|';

      expectObservable(e1.pipe(exhaustAll())).toBe(expected);
      expectSubscriptions(x.subscriptions).toBe(xsubs);
    });
  });

  it('should handle an observable of promises', (done) => {
    const expected = [1];

    of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3))
      .pipe(exhaustAll())
      .subscribe(
        (x) => {
          expect(x).to.equal(expected.shift());
        },
        null,
        () => {
          expect(expected.length).to.equal(0);
          done();
        }
      );
  });

  it('should handle an observable of promises, where one rejects', (done) => {
    of(Promise.reject(2), Promise.resolve(1))
      .pipe(exhaustAll())
      .subscribe(
        (x) => {
          done(new Error('should not be called'));
        },
        (err) => {
          expect(err).to.equal(2);
          done();
        },
        () => {
          done(new Error('should not be called'));
        }
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
      .pipe(exhaustAll(), take(3))
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
