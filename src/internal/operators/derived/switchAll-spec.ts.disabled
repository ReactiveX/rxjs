import { expect } from 'chai';
import { Observable, of, NEVER, queueScheduler, Subject, fromScheduled } from 'rxjs';
import { map, switchAll, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {switch} */
describe('switchAll', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('switchAll')
  it('should switch a hot observable of cold observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(    '--a---b--c---d--|      ');
      const y = cold(           '----e---f--g---|');
      const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
      const expected = '----a---b----e---f--g---|';

      expectObservable(e1.pipe(switchAll())).toBe(expected);
    });
  });

  it('should switch to each immediately-scheduled inner Observable', (done) => {
    const a = fromScheduled([1, 2, 3], queueScheduler);
    const b = fromScheduled([4, 5, 6], queueScheduler);
    const r = [1, 4, 5, 6];
    let i = 0;
    fromScheduled([a, b], queueScheduler)
      .pipe(switchAll())
      .subscribe((x) => {
        expect(x).to.equal(r[i++]);
      }, null, done);
  });

  it('should unsub inner observables', () => {
    const unsubbed: string[] = [];

    of('a', 'b').pipe(
      map((x) =>
      new Observable<string>((subscriber) => {
        subscriber.complete();
        return () => {
          unsubbed.push(x);
        };
      })),
      switchAll(),
    ).subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch to each inner Observable', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6);
    const r = [1, 2, 3, 4, 5, 6];
    let i = 0;
    of(a, b).pipe(switchAll()).subscribe((x) => {
      expect(x).to.equal(r[i++]);
    }, null, done);
  });

  it('should handle a hot observable of observables', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|         ');
      const xsubs =    '      ^       !              ';
      const y = cold(                '---d--e---f---|');
      const ysubs =    '              ^             !';
      const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---b----d--e---f---|';
      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|         ');
      const xsubs =    '      ^       !              ';
      const y = cold(                '---d--e---f---|');
      const ysubs =    '              ^ !            ';
      const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
      const unsub =    '                !            ';
      const expected = '--------a---b---             ';
      expectObservable(e1.pipe(switchAll()), unsub).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|         ');
      const xsubs =    '      ^       !              ';
      const y = cold(                '---d--e---f---|');
      const ysubs =    '              ^ !            ';
      const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---b----            ';
      const unsub =    '                !            ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        switchAll(),
        mergeMap((x) => of(x)),
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, inner never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|          ');
      const xsubs =    '      ^       !               ';
      const y = cold(                '---d--e---f-----');
      const ysubs =    '              ^               ';
      const e1 = hot(  '------x-------y------|        ', { x: x, y: y });
      const expected = '--------a---b----d--e---f-----';
      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should handle a synchronous switch to the second inner observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|   ');
      const xsubs =    '      (^!)             ';
      const y = cold(        '---d--e---f---|  ');
      const ysubs =    '      ^             !  ';
      const e1 = hot(  '------(xy)------------|', { x: x, y: y });
      const expected = '---------d--e---f-----|';
      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, one inner throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---#                ');
      const xsubs =    '      ^     !                ';
      const y = cold(                '---d--e---f---|');
      const ysubs: string[] = [];
      const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
      const expected = '--------a---#                ';
      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should handle a hot observable of observables, outer throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|         ');
      const xsubs =    '      ^       !              ';
      const y = cold(                '---d--e---f---|');
      const ysubs =    '              ^       !      ';
      const e1 = hot(  '------x-------y-------#      ', { x: x, y: y });
      const expected = '--------a---b----d--e-#      ';
      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(y).toBe(ysubs);
    });
  });

  it('should handle an empty hot observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('------|');
      const e1subs =   '^     !';
      const expected = '------|';

      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle a never hot observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('-');
      const e1subs =   '^';
      const expected = '-';

      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should complete not before the outer completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const x = cold(        '--a---b---c--|   ');
      const xsubs =    '      ^            !   ';
      const e1 = hot(  '------x---------------|', { x: x });
      const e1subs =   '^                     !';
      const expected = '--------a---b---c-----|';

      expectObservable(e1.pipe(switchAll())).toBe(expected);
      expectSubscriptionsTo(x).toBe(xsubs);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should handle an observable of promises', (done) => {
    const expected = [3];

    of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3))
      .pipe(switchAll())
      .subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should handle an observable of promises, where last rejects', (done) => {
    of(Promise.resolve(1), Promise.resolve(2), Promise.reject(3))
      .pipe(switchAll())
      .subscribe(() => {
        done(new Error('should not be called'));
      }, (err) => {
        expect(err).to.equal(3);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should handle an observable with Arrays in it', () => {
    const expected = [1, 2, 3, 4];
    let completed = false;

    of<any>(NEVER, NEVER, [1, 2, 3, 4])
      .pipe(switchAll())
      .subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        completed = true;
        expect(expected.length).to.equal(0);
      });

    expect(completed).to.be.true;
  });
});
