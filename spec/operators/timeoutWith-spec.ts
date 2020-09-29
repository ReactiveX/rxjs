/** @prettier */
import { expect } from 'chai';
import { timeoutWith, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable, EMPTY } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {timeoutWith} */
describe('timeoutWith operator', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should timeout after a specified period then subscribe to the passed observable', () => {
    rxTestScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const source = cold('  -------a--b--|');
      const sourceSubs = '   ^----!        ';
      const t = time('       -----|');
      const switchTo = cold('     x-y-z-|  ');
      const switchToSubs = ' -----^-----!  ';
      const expected = '     -----x-y-z-|  ';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should timeout at a specified date then subscribe to the passed observable', () => {
    rxTestScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const source = cold('  -');
      const sourceSubs = '   ^---------!           ';
      const t = time('       ----------|')
      const switchTo = cold('          --x--y--z--|');
      const switchToSubs = ' ----------^----------!';
      const expected = '     ------------x--y--z--|';

      // The the current frame is zero.
      const result = source.pipe(timeoutWith(new Date(t), switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should timeout after a specified period between emit then subscribe to the passed observable when source emits', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b------c---|');
      const t = time('             ----|       ')
      const sourceSubs = '  ^----------!       ';
      const switchTo = cold('          -x-y-|  ');
      const switchToSubs = '-----------^----!  ';
      const expected = '    ---a---b----x-y-|  ';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b-----c----|');
      const t = time('             ----|       ')
      const sourceSubs = '  ^----------!       ';
      const switchTo = cold('          -x---y| ');
      const switchToSubs = '-----------^--!    ';
      const expected = '    ---a---b----x--    ';
      const unsub = '       --------------!    ';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b-----c----|');
      const t = time('      ----|              ');
      const sourceSubs = '  ^----------!       ';
      const switchTo = cold('          -x---y| ');
      const switchToSubs = '-----------^--!    ';
      const expected = '    ---a---b----x--    ';
      const unsub = '       --------------!    ';

      const result = source.pipe(
        mergeMap((x) => of(x)),
        timeoutWith(t, switchTo, rxTestScheduler),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should not subscribe to withObservable after explicit unsubscription', () => {
    rxTestScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const source = cold('---a------b------');
      const t = time('     -----|           ')
      const sourceSubs = ' ^----!           ';
      const switchTo = cold('   i---j---|   ');
      const expected = '   ---a--           ';
      const unsub = '      -----!           ';

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        timeoutWith(t, switchTo, rxTestScheduler),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });

  it('should timeout after a specified period then subscribe to the passed observable when source is empty', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------|      ');
      const t = time('      ----------|         ')
      const sourceSubs = '  ^---------!         ';
      const switchTo = cold('         ----x----|');
      const switchToSubs = '----------^--------!';
      const expected = '    --------------x----|';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should timeout after a specified period between emit then never completes if other source does not complete', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  --a--b--------c--d--|');
      const t = time('           ----|           ');
      const sourceSubs = '  ^--------!           ';
      const switchTo = cold('        ------------');
      const switchToSubs = '---------^-----------';
      const expected = '    --a--b---------------';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should timeout after a specified period then subscribe to the passed observable when source raises error after timeout', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------#      ');
      const t = time('      ----------|         ');
      const sourceSubs = '  ^---------!         ';
      const switchTo = cold('         ----x----|');
      const switchToSubs = '----------^--------!';
      const expected = '    --------------x----|';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should timeout after a specified period between emit then never completes if other source emits but not complete', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -------------|      ');
      const t = time('      -----------|        ')
      const sourceSubs = '  ^----------!        ';
      const switchTo = cold('          ----x----');
      const switchToSubs = '-----------^--------';
      const expected = '    ---------------x----';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe(switchToSubs);
    });
  });

  it('should not timeout if source completes within timeout period', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('  -----|        ');
      const t = time('      ----------|   ');
      const sourceSubs = '  ^----!        ';
      const switchTo = cold('    ----x----');
      const expected = '    -----|        ';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });

  it('should not timeout if source raises error within timeout period', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('-----#              ');
      const t = time('    ----------|         ');
      const sourceSubs = '^----!              ';
      const switchTo = cold('       ----x----|');
      const expected = '  -----#              ';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });

  it('should not timeout if source emits within timeout period', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('   --a--b--c--d--e--|');
      const t = time('       -----|            ');
      const sourceSubs = '   ^----------------!';
      const switchTo = cold('----x----|        ');
      const expected = '     --a--b--c--d--e--|';

      const result = source.pipe(timeoutWith(t, switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });

  it('should not timeout if source completes within specified Date', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|   ');
      const t = time('    --------------------|');
      const sourceSubs = '^----------------!   ';
      const switchTo = cold('--x--|            ');
      const expected = '  --a--b--c--d--e--|   ';

      // Start frame is zero.
      const result = source.pipe(timeoutWith(new Date(t), switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
    });
  });

  it('should not timeout if source raises error within specified Date', () => {
    rxTestScheduler.run(({ hot, cold, time, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---#           ');
      const t = time('       ----------|     ');
      const sourceSubs = '^------!           ';
      const switchTo = cold('          --x--|');
      const expected = '  ---a---#           ';

      // Start frame is zero.
      const result = source.pipe(timeoutWith(new Date(t), switchTo, rxTestScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(switchTo.subscriptions).toBe([]);
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
      timeoutWith(0, EMPTY),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
