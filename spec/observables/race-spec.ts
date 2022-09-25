/** @prettier */
import { race, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {race} */
describe('race', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should race a single observable', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|');
      const e1subs = '  ^-------------------!';
      const expected = '---a-----b-----c----|';

      const result = race(e1);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should race cold and cold', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should race with array of observable', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';

      const result = race([e1, e2]);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should race hot and hot', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should race hot and cold', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should race 2nd and 1st', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ------x-----y-----z----|');
      const e1subs = '  ^--!                    ';
      const e2 = cold(' ---a-----b-----c----|   ');
      const e2subs = '  ^-------------------!   ';
      const expected = '---a-----b-----c----|   ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should race emit and complete', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -----|                  ');
      const e1subs = '  ^----!                  ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^----!                  ';
      const expected = '-----|                  ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-----------!           ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b---           ';
      const unsub = '   ------------!           ';

      const result = race(e1, e2);

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--^--b--c---d-| ');
      const e1subs = '       ^--------!    ';
      const e2 = hot('  ---e-^---f--g---h-|');
      const e2subs = '       ^--!          ';
      const expected = '     ---b--c---    ';
      const unsub = '        ---------!    ';

      const result = race(e1.pipe(mergeMap((x: string) => of(x))), e2.pipe(mergeMap((x: string) => of(x)))).pipe(
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should never emit when given non emitting sources', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---|');
      const e2 = cold(' ---|');
      const e1subs = '  ^--!';
      const expected = '---|';

      const source = race(e1, e2);

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should throw when error occurs mid stream', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----#              ');
      const e1subs = '  ^--------!              ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----#              ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should throw when error occurs before a winner is found', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---#                    ');
      const e1subs = '  ^--!                    ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---#                    ';

      const result = race(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('handle empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      const source = race(e1);

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('handle never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      const source = race(e1);

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('handle throw', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      const source = race(e1);

      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should support a single ObservableInput argument', (done) => {
    const source = race(Promise.resolve(42));
    source.subscribe({
      next: (value) => {
        expect(value).to.equal(42);
      },
      error: done,
      complete: done,
    });
  });
});
