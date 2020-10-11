/** @prettier */
import { expect } from 'chai';
import { of, Subject } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { VirtualTimeScheduler } from '../../src/internal/scheduler/VirtualTimeScheduler';

/** @test {debounceTime} */
describe('debounceTime', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should debounce values by 2 time units', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--bc--d---|');
      const e1subs = '  ^-----------!';
      const expected = '---a---c--d-|';

      expectObservable(e1.pipe(debounceTime(2, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay all elements by the specified time', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b------c----|');
      const e1subs = '  ^---------------------!';
      const expected = '------a--------b------(c|)';

      expectObservable(e1.pipe(debounceTime(5, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce and delay element by the specified time', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-----------d-------|');
      const e1subs = '  ^--------------------------!';
      const expected = '---------c--------------d--|';

      expectObservable(e1.pipe(debounceTime(5, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const expected = '-----|';

      expectObservable(e1.pipe(debounceTime(1, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(debounceTime(1, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source does not emit and raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const e1subs = '  ^----!';
      const expected = '-----#';

      expectObservable(e1.pipe(debounceTime(1, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      expectObservable(e1.pipe(debounceTime(1, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(debounceTime(2, testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--bc--d----|');
      const e1subs = '  ^------!       ';
      const expected = '----a---       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        debounceTime(2, testScheduler),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce and does not complete when source does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-----------d-------');
      const e1subs = '  ^--------------------------';
      const expected = '---------c--------------d--';

      expectObservable(e1.pipe(debounceTime(5, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not completes when source does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(debounceTime(1, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not completes when source never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(debounceTime(1, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay all elements until source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b------c----#');
      const e1subs = '  ^---------------------!';
      const expected = '------a--------b------#';

      expectObservable(e1.pipe(debounceTime(5, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce all elements while source emits within given time', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--h-|');
      const e1subs = '  ^------------------------!';
      const expected = '-------------------------(h|)';

      expectObservable(e1.pipe(debounceTime(4, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce all element while source emits within given time until raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--e--f--g--h-#');
      const e1subs = '  ^------------------------!';
      const expected = '-------------------------#';

      expectObservable(e1.pipe(debounceTime(4, testScheduler))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should debounce correctly when synchronously reentered', () => {
    const results: number[] = [];
    const source = new Subject<number>();
    const scheduler = new VirtualTimeScheduler();

    source.pipe(debounceTime(0, scheduler)).subscribe((value) => {
      results.push(value);

      if (value === 1) {
        source.next(2);
      }
    });
    source.next(1);
    scheduler.flush();

    expect(results).to.deep.equal([1, 2]);
  });
});
