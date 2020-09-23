/** @prettier */
import { expect } from 'chai';
import { timeout, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { TimeoutError, of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {timeout} */
describe('timeout operator', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  const defaultTimeoutError = new TimeoutError();

  it('should timeout after a specified timeout period', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
      const e1 = cold(' -------a--b--|');
      const t = time('  -----|        ');
      const e1subs = '  ^----!        ';
      const expected = '-----#        ';

      const result = e1.pipe(timeout(t, rxTestScheduler));

      expectObservable(result).toBe(expected, null, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should emit and TimeoutError on timeout with appropriate due as number', () => {
    rxTestScheduler.run(({ cold, time }) => {
      const e1 = cold('-------a--b--|');
      const t = time(' -----|');
      const result = e1.pipe(timeout(t, rxTestScheduler));
      let error: any;
      result.subscribe(
        () => {
          throw new Error('this should not next');
        },
        (err) => {
          error = err;
        },
        () => {
          throw new Error('this should not complete');
        }
      );
      rxTestScheduler.flush();
      expect(error).to.be.an.instanceof(TimeoutError);
      expect(error).to.have.property('name', 'TimeoutError');
      expect(error!.info).to.deep.equal({
        seen: 0,
        meta: null,
        lastValue: null,
      });
    });
  });

  it('should emit and TimeoutError on timeout with appropriate due as Date', () => {
    rxTestScheduler.run(({ cold, time }) => {
      const e1 = cold('-------a--b--|');
      const t = time(' ----|');

      // 4ms from "now", considering "now" with the rxTestScheduler is currently frame 0.
      const dueDate = new Date(t);

      const result = e1.pipe(timeout(dueDate, rxTestScheduler));
      let error: any;
      result.subscribe(
        () => {
          throw new Error('this should not next');
        },
        (err) => {
          error = err;
        },
        () => {
          throw new Error('this should not complete');
        }
      );
      rxTestScheduler.flush();
      expect(error).to.be.an.instanceof(TimeoutError);
      expect(error).to.have.property('name', 'TimeoutError');
      expect(error!.info).to.deep.equal({
        seen: 0,
        meta: null,
        lastValue: null,
      });
    });
  });

  it('should not timeout if source completes within absolute timeout period', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const t = time('  --------------------|');
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';

      // Start frame is zero.
      const timeoutValue = new Date(t);

      expectObservable(e1.pipe(timeout(timeoutValue, rxTestScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not timeout if source emits within timeout period', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c--d--e--|');
      const t = time('  -----|            ');
      const e1subs = '  ^----------------!';
      const expected = '--a--b--c--d--e--|';

      expectObservable(e1.pipe(timeout(t, rxTestScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c---d--e--|');
      const t = time('  -----|             ');
      const unsub = '   ----------!        ';
      const e1subs = '  ^---------!        ';
      const expected = '--a--b--c--        ';

      const result = e1.pipe(timeout(t, rxTestScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  --a--b--c---d--e--|');
      const t = time('  -----|             ');
      const e1subs = '  ^---------!        ';
      const expected = '--a--b--c--        ';
      const unsub = '   ----------!        ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        timeout(t, rxTestScheduler),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should timeout after a specified timeout period between emit with default error while source emits', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
      const e1 = hot('  ---a---b---c------d---e---|');
      const t = time('             -----|');
      const e1subs = '  ^---------------!          ';
      const expected = '---a---b---c----#          ';

      const result = e1.pipe(timeout(t, rxTestScheduler));

      expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should timeout at a specified Date', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
      const e1 = cold(' -');
      const t = time('  ----------|');
      const e1subs = '  ^---------!';
      const expected = '----------#';

      // Start time is zero
      const result = e1.pipe(timeout(new Date(t), rxTestScheduler));

      expectObservable(result).toBe(expected, null, defaultTimeoutError);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with synchronous observable', () => {
    expect(() => {
      of(1).pipe(timeout(10)).subscribe();
    }).to.not.throw();
  });

  describe('config', () => {
    it('should timeout after a specified timeout period', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
        const e1 = cold(' -------a--b--|');
        const t = time('  -----|        ');
        const e1subs = '  ^----!        ';
        const expected = '-----#        ';

        const result = e1.pipe(
          timeout({
            each: t,
          })
        );

        expectObservable(result).toBe(expected, null, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should emit and TimeoutError on timeout with appropriate due as number', () => {
      rxTestScheduler.run(({ cold, time }) => {
        const e1 = cold('-------a--b--|');
        const t = time(' -----|');
        const result = e1.pipe(timeout({ each: t }));
        let error: any;
        result.subscribe(
          () => {
            throw new Error('this should not next');
          },
          (err) => {
            error = err;
          },
          () => {
            throw new Error('this should not complete');
          }
        );
        rxTestScheduler.flush();
        expect(error).to.be.an.instanceof(TimeoutError);
        expect(error).to.have.property('name', 'TimeoutError');
        expect(error!.info).to.deep.equal({
          seen: 0,
          meta: null,
          lastValue: null,
        });
      });
    });

    it('should emit and TimeoutError on timeout with appropriate due as Date', () => {
      rxTestScheduler.run(({ cold, time }) => {
        const e1 = cold('-------a--b--|');
        const t = time(' ----|');

        // 4ms from "now", considering "now" with the rxTestScheduler is currently frame 0.
        const dueDate = new Date(t);

        const result = e1.pipe(timeout({ first: dueDate }));
        let error: any;
        result.subscribe(
          () => {
            throw new Error('this should not next');
          },
          (err) => {
            error = err;
          },
          () => {
            throw new Error('this should not complete');
          }
        );
        rxTestScheduler.flush();
        expect(error).to.be.an.instanceof(TimeoutError);
        expect(error).to.have.property('name', 'TimeoutError');
        expect(error!.info).to.deep.equal({
          seen: 0,
          meta: null,
          lastValue: null,
        });
      });
    });

    it('should not timeout if source completes within absolute timeout period', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
        const e1 = hot('  --a--b--c--d--e--|');
        const t = time('  --------------------|');
        const e1subs = '  ^----------------!';
        const expected = '--a--b--c--d--e--|';

        expectObservable(e1.pipe(timeout({ first: new Date(t) }))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should not timeout if source emits within timeout period', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
        const e1 = hot('  --a--b--c--d--e--|');
        const t = time('  -----|            ');
        const e1subs = '  ^----------------!';
        const expected = '--a--b--c--d--e--|';

        expectObservable(e1.pipe(timeout({ each: t }))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should allow unsubscribing explicitly and early', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
        const e1 = hot('  --a--b--c---d--e--|');
        const t = time('  -----|             ');
        const unsub = '   ----------!        ';
        const e1subs = '  ^---------!        ';
        const expected = '--a--b--c--        ';

        const result = e1.pipe(timeout({ each: t }));

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
        const e1 = hot('  --a--b--c---d--e--|');
        const t = time('  -----|             ');
        const e1subs = '  ^---------!        ';
        const expected = '--a--b--c--        ';
        const unsub = '   ----------!        ';

        const result = e1.pipe(
          mergeMap((x) => of(x)),
          timeout({ each: t }),
          mergeMap((x) => of(x))
        );

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should timeout after a specified timeout period between emit with default error while source emits', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions, time }) => {
        const e1 = hot('  ---a---b---c------d---e---|');
        const t = time('             -----|');
        const e1subs = '  ^---------------!          ';
        const expected = '---a---b---c----#          ';

        const result = e1.pipe(timeout({ each: t }));

        expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should timeout at a specified Date', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
        const e1 = cold(' -');
        const t = time('  ----------|');
        const e1subs = '  ^---------!';
        const expected = '----------#';

        // Start time is zero
        const result = e1.pipe(timeout({ first: new Date(t) }));

        expectObservable(result).toBe(expected, null, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should timeout at a specified time for first value only', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
        const e1 = cold(' -');
        const t = time('  ----------|');
        const e1subs = '  ^---------!';
        const expected = '----------#';

        // Start time is zero
        const result = e1.pipe(timeout({ first: t }));

        expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should not timeout for long delays if only first is specified', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
        const e1 = cold(' ---a-----------------------b---|');
        const t = time('     ----------|');
        const e1subs = '  ^------------------------------!';
        const expected = '---a-----------------------b---|';

        // Start time is zero
        const result = e1.pipe(timeout({ first: t }));

        expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should not timeout for long delays if only first is specified as Date', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
        const e1 = cold(' ---a-----------------------b---|');
        const t = time('  ----------|');
        const e1subs = '  ^------------------------------!';
        const expected = '---a-----------------------b---|';

        // Start time is zero
        const result = e1.pipe(timeout({ first: new Date(t) }));

        expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should timeout for long delays if first is specified as Date AND each is specified', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions, time }) => {
        const e1 = cold('   ---a-----------------------b---|');
        const first = time('-------------|');
        const each = time('    ------|');
        const e1subs = '    ^--------!';
        const expected = '  ---a-----#';

        // Start time is zero
        const result = e1.pipe(timeout({ first: new Date(first), each }));

        expectObservable(result).toBe(expected, undefined, defaultTimeoutError);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });
  });

  describe('using with', () => {
    it('should timeout after a specified period then subscribe to the passed observable', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = cold('  -------a--b--|');
        const sourceSubs = '   ^----!        ';
        const t = time('       -----|');
        const inner = cold('        x-y-z-|  ');
        const innerSubs = '    -----^-----!  ';
        const expected = '     -----x-y-z-|  ';

        const result = source.pipe(timeout({
          each: t,
          with: () => inner,
        }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should timeout at a specified date then subscribe to the passed observable', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = cold('  -');
        const sourceSubs = '   ^---------!           ';
        const t = time('       ----------|');
        const inner = cold('             --x--y--z--|');
        const innerSubs = '    ----------^----------!';
        const expected = '     ------------x--y--z--|';

        // The the current frame is zero.
        const result = source.pipe(timeout({
          first: new Date(t),
          with: () => inner,
        }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should timeout after a specified period between emit then subscribe to the passed observable when source emits', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  ---a---b------c---|');
        const t = time('             ----|       ');
        const sourceSubs = '  ^----------!       ';
        const inner = cold('             -x-y-|  ');
        const innerSubs = '   -----------^----!  ';
        const expected = '    ---a---b----x-y-|  ';

        const result = source.pipe(timeout({
          each: t,
          with: () => inner, }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should allow unsubscribing explicitly and early', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  ---a---b-----c----|');
        const t = time('             ----|       ');
        const sourceSubs = '  ^----------!       ';
        const inner = cold('             -x---y| ');
        const innerSubs = '   -----------^--!    ';
        const expected = '    ---a---b----x--    ';
        const unsub = '       --------------!    ';

        const result = source.pipe(timeout({ each: t, with: () => inner }));

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should not break unsubscription chain when unsubscribed explicitly', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  ---a---b-----c----|');
        const t = time('      ----|              ');
        const sourceSubs = '  ^----------!       ';
        const inner = cold('             -x---y| ');
        const innerSubs = '   -----------^--!    ';
        const expected = '    ---a---b----x--    ';
        const unsub = '       --------------!    ';

        const result = source.pipe(
          mergeMap((x) => of(x)),
          timeout({ each: t, with: () => inner, }),
          mergeMap((x) => of(x))
        );

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should not subscribe to withObservable after explicit unsubscription', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = cold('---a------b------');
        const t = time('     -----|           ');
        const sourceSubs = ' ^----!           ';
        const inner = cold('      i---j---|   ');
        const expected = '   ---a--           ';
        const unsub = '      -----!           ';

        const result = source.pipe(
          mergeMap((x) => of(x)),
          timeout({ each: t, with: () => inner }),
          mergeMap((x) => of(x))
        );

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe([]);
      });
    });

    it('should timeout after a specified period then subscribe to the passed observable when source is empty', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  -------------|      ');
        const t = time('      ----------|         ');
        const sourceSubs = '  ^---------!         ';
        const inner = cold('            ----x----|');
        const innerSubs = '   ----------^--------!';
        const expected = '    --------------x----|';

        const result = source.pipe(timeout({ each: t, with: () => inner, }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should timeout after a specified period between emit then never completes if other source does not complete', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  --a--b--------c--d--|');
        const t = time('           ----|           ');
        const sourceSubs = '  ^--------!           ';
        const inner = cold('           ------------');
        const innerSubs = '   ---------^-----------';
        const expected = '    --a--b---------------';

        const result = source.pipe(timeout({ each: t, with: () => inner, }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should timeout after a specified period then subscribe to the passed observable when source raises error after timeout', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  -------------#      ');
        const t = time('      ----------|         ');
        const sourceSubs = '  ^---------!         ';
        const inner = cold('            ----x----|');
        const innerSubs = '   ----------^--------!';
        const expected = '    --------------x----|';

        const result = source.pipe(timeout({ each: t, with: () => inner, }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should timeout after a specified period between emit then never completes if other source emits but not complete', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  -------------|      ');
        const t = time('      -----------|        ');
        const sourceSubs = '  ^----------!        ';
        const inner = cold('             ----x----');
        const innerSubs = '   -----------^--------';
        const expected = '    ---------------x----';

        const result = source.pipe(timeout({ each: t, with: () => inner }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe(innerSubs);
      });
    });

    it('should not timeout if source completes within timeout period', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('  -----|        ');
        const t = time('      ----------|   ');
        const sourceSubs = '  ^----!        ';
        const inner = cold('            ----x----');
        const expected = '    -----|        ';

        const result = source.pipe(timeout({ each: t, with: () => inner }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe([]);
      });
    });

    it('should not timeout if source raises error within timeout period', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('-----#              ');
        const t = time('    ----------|         ');
        const sourceSubs = '^----!              ';
        const inner = cold('       ----x----|');
        const expected = '  -----#              ';

        const result = source.pipe(timeout({ each: t, with: () => inner }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe([]);
      });
    });

    it('should not timeout if source emits within timeout period', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('   --a--b--c--d--e--|');
        const t = time('       -----|            ');
        const sourceSubs = '   ^----------------!';
        const inner = cold('        ----x----|   ');
        const expected = '     --a--b--c--d--e--|';

        const result = source.pipe(timeout({ each: t, with: () => inner }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe([]);
      });
    });

    it('should not timeout if source completes within specified Date', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('--a--b--c--d--e--|   ');
        const t = time('    --------------------|');
        const sourceSubs = '^----------------!   ';
        const inner = cold('--x--|            ');
        const expected = '  --a--b--c--d--e--|   ';

        // Start frame is zero.
        const result = source.pipe(timeout({ first: new Date(t), with: () => inner }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe([]);
      });
    });

    it('should not timeout if source raises error within specified Date', () => {
      rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
        const source = hot('---a---#           ');
        const t = time('       ----------|     ');
        const sourceSubs = '^------!           ';
        const inner = cold('             --x--|');
        const expected = '  ---a---#           ';

        // Start frame is zero.
        const result = source.pipe(timeout({ first: new Date(t), with: () => inner }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(inner.subscriptions).toBe([]);
      });
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      timeout(0),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
