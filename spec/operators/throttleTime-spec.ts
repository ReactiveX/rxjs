/** @prettier */
import { expect } from 'chai';
import { throttleTime, take, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, concat, timer } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {throttleTime} */
describe('throttleTime operator', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  describe('default behavior { leading: true, trailing: false }', () => {
    it('should immediately emit the first value in each time window', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-x-y----b---x-cx---|');
        //                 ----|    ----| ----|
        const expected = '-a--------b-----c----|';
        const subs = '    ^--------------------!';

        const result = e1.pipe(throttleTime(5, rxTest));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should throttle events by 5 time units', (done) => {
      of(1, 2, 3)
        .pipe(throttleTime(5))
        .subscribe(
          (x: number) => {
            expect(x).to.equal(1);
          },
          null,
          done
        );
    });

    it('should throttle events multiple times', () => {
      const expected = ['1-0', '2-0'];
      concat(
        timer(0, 1, rxTest).pipe(
          take(3),
          map((x: number) => '1-' + x)
        ),
        timer(8, 1, rxTest).pipe(
          take(5),
          map((x: number) => '2-' + x)
        )
      )
        .pipe(throttleTime(5, rxTest))
        .subscribe((x: string) => {
          expect(x).to.equal(expected.shift());
        });

      rxTest.flush();
    });

    it('should simply mirror the source if values are not emitted often enough', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--------b-----c----|');
        const subs = '    ^--------------------!';
        const expected = '-a--------b-----c----|';

        expectObservable(e1.pipe(throttleTime(5, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should handle a busy producer emitting a regular repeating sequence', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  abcdefabcdefabcdefabcdefa|');
        const subs = '    ^------------------------!';
        const expected = 'a-----a-----a-----a-----a|';

        expectObservable(e1.pipe(throttleTime(5, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should complete when source does not emit', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -----|');
        const subs = '    ^----!';
        const expected = '-----|';

        expectObservable(e1.pipe(throttleTime(5, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should raise error when source does not emit and raises error', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -----#');
        const subs = '    ^----!';
        const expected = '-----#';

        expectObservable(e1.pipe(throttleTime(10, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should handle an empty source', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold(' |');
        const subs = '    (^!)';
        const expected = '|';

        expectObservable(e1.pipe(throttleTime(30, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should handle a never source', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold(' -');
        const subs = '    ^';
        const expected = '-';

        expectObservable(e1.pipe(throttleTime(30, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should handle a throw source', () => {
      rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold(' #');
        const subs = '    (^!)';
        const expected = '#';

        expectObservable(e1.pipe(throttleTime(30, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should throttle and does not complete when source does not completes', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--(bc)-------d----------------');
        const unsub = '   -------------------------------!';
        const subs = '    ^------------------------------!';
        const expected = '-a-------------d----------------';

        expectObservable(e1.pipe(throttleTime(5, rxTest)), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--(bc)-------d----------------');
        const subs = '    ^------------------------------!';
        const expected = '-a-------------d----------------';
        const unsub = '   -------------------------------!';

        const result = e1.pipe(
          mergeMap((x: string) => of(x)),
          throttleTime(5, rxTest),
          mergeMap((x: string) => of(x))
        );

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });

    it('should throttle values until source raises error', () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--(bc)-------d---------------#');
        const subs = '    ^------------------------------!';
        const expected = '-a-------------d---------------#';

        expectObservable(e1.pipe(throttleTime(5, rxTest))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
      });
    });
  });

  describe('throttleTime(fn, { leading: true, trailing: true })', () => {
    it('should immediately emit the first and last values in each time window', () => {
      rxTest.run(({ hot, time, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-xy-----b--x--cxxx--|');
        const e1subs = '  ^---------------------!';
        const t = time('   ----|                 ');
        //                     ----|----|---|---|
        const expected = '-a---y----b---x---x---(x|)';

        const result = e1.pipe(throttleTime(t, rxTest, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should emit the value if only a single one is given', () => {
      rxTest.run(({ hot, time, expectObservable }) => {
        const e1 = hot('  -a--------------------|');
        const t = time('   ----|                 ');
        const expected = '-a--------------------|';

        const result = e1.pipe(throttleTime(t, rxTest, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
      });
    });
  });

  describe('throttleTime(fn, { leading: false, trailing: true })', () => {
    it('should immediately emit the last value in each time window', () => {
      rxTest.run(({ hot, time, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-xy-----b--x--cxxx--|');
        const e1subs = '  ^---------------------!';
        const t = time('   ----|                 ');
        //                 ----|---|----|---|---|
        const expected = '-----y--------x---x---(x|)';

        const result = e1.pipe(throttleTime(t, rxTest, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should emit the last throttled value when complete', () => {
      rxTest.run(({ hot, time, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-xy-----b--x--cxx-|');
        const e1subs = '  ^-------------------!';
        const t = time('   ----|               ');
        //                 ----|---|----|---|---|
        const expected = '-----y--------x---x-|';

        const result = e1.pipe(throttleTime(t, rxTest, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should emit the value if only a single one is given', () => {
      rxTest.run(({ hot, time, expectObservable }) => {
        const e1 = hot('  -a--------------------|');
        const t = time('   ----|                 ');
        const expected = '-----a----------------|';

        const result = e1.pipe(throttleTime(t, rxTest, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
      });
    });
  });
});
