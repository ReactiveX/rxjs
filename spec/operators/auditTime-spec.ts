/** @prettier */
import { expect } from 'chai';
import { of } from 'rxjs';
import { auditTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {auditTime} */
describe('auditTime', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit the last value in each time window', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y----b---x-cx---|');
      const e1subs = '  ^--------------------!';
      const t = time('   -----|               ');
      //                          -----|
      //                                -----|
      const expected = '------y--------x-----(x|)';

      const result = e1.pipe(auditTime(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should auditTime events by 5 time units', (done) => {
    const expected = 3;
    of(1, 2, 3)
      .pipe(auditTime(5))
      .subscribe((x: number) => {
        expect(x).to.equal(expected);
        done();
      });
  });

  it('should auditTime events multiple times', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -012-----01234---|');
      const e1subs = '  ^----------------!';
      const t = time('   -----|           ');
      //                         -----|
      const expected = '------2-------4--|';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay the source if values are not emitted often enough', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--------b-----c----|');
      const e1subs = '  ^--------------------!';
      const t = time('   -----|               ');
      //                          -----|
      //                                -----|
      const expected = '------a--------b-----(c|)';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const t = time('  -----|                    ');
      //                      -----|
      //                            -----|
      //                                  -----|
      //                                        -----|
      const expected = '-----f-----f-----f-----f-----(a|)';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const e1subs = '  ^----!';
      const t = time('  --|   ');
      const expected = '-----|';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source does not emit and raises error', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const e1subs = '  ^----!';
      const t = time('  --|   ');
      const expected = '-----#';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const t = time('  ---|');
      const expected = '|   ';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -  ');
      const e1subs = '  ^  ';
      const t = time('  --|');
      const expected = '-  ';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle a throw source', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const t = time('  ---|');
      const expected = '#   ';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete when source does not complete', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d----------------');
      const e1subs = '  ^------------------------------!';
      const t = time('   -----|                         ');
      //                               -----|
      const expected = '------c-------------d-----------';
      const unsub = '   -------------------------------!';

      expectObservable(e1.pipe(auditTime(t)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d----------------');
      const e1subs = '  ^------------------------------!';
      const t = time('   -----|                         ');
      //                               -----|
      const expected = '------c-------------d-----------';
      const unsub = '   -------------------------------!';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        auditTime(t),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should auditTime values until source raises error', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a--(bc)-------d---------------#');
      const e1subs = '  ^------------------------------!';
      const t = time('   -----|                         ');
      //                               -----|
      const expected = '------c-------------d----------#';

      expectObservable(e1.pipe(auditTime(t))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
