/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { observableMatcher } from '../helpers/observableMatcher';
import { throttle, mergeMap, mapTo, take } from 'rxjs/operators';
import { of, concat, timer, Observable } from 'rxjs';

/** @test {throttle} */
describe('throttle', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should immediately emit the first value in each time window', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^a-xy-----b--x--cxxx-|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----x----------------');
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle sync source with sync notifier and trailing appropriately', () => {
    let results: any[] = [];
    const source = of(1).pipe(throttle(() => of(1), { leading: false, trailing: true }));

    source.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('done'),
    });

    expect(results).to.deep.equal([1, 'done']);
  });

  it('should simply mirror the source if values are not emitted often enough', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^a--------b-----c----|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----|                ');
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should throttle with duration Observable using next to close the duration', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ^a-xy-----b--x--cxxx-|');
      const e1subs = '  ^--------------------!';
      const e2 = cold('  ----x-y-z            ');
      const e2subs = [
        '               -^---!                ',
        '               ----------^---!       ',
        '               ----------------^---! ',
      ];
      const expected = '-a--------b-----c----|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should interrupt source and duration when result is unsubscribed early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y-z-xyz-x-y-z----b--x-x-|');
      const unsub = '   --------------!               ';
      const e1subs = '  ^-------------!               ';
      const e2 = cold('  ---------------------|       ');
      const e2subs = '  -^------------!               ';
      const expected = '-a-------------               ';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -a-x-y-z-xyz-x-y-z----b--x-x-|');
      const e1subs = '  ^-------------!               ';
      const e2 = cold('  ------------------|           ');
      const e2subs = '  -^------------!               ';
      const expected = '-a-------------               ';
      const unsub = '   --------------!               ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        throttle(() => e2),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' -----|                    ');
      const e2subs = [
        '               ^----!                    ',
        '               ------^----!              ',
        '               ------------^----!        ',
        '               ------------------^----!  ',
        '               ------------------------^!',
      ];
      const expected = 'a-----a-----a-----a-----a|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should mirror source if durations are immediate', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' x                         ');
      const expected = 'abcdefabcdefabcdefabcdefa|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should mirror source if durations are empty', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^------------------------!';
      const e2 = cold(' |                         ');
      const expected = 'abcdefabcdefabcdefabcdefa|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take only the first value emitted if duration is a never', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^----------------------------!';
      const e2 = cold(' -                             ');
      const e2subs = '  ----^------------------------!';
      const expected = '----a------------------------|';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should unsubscribe duration Observable when source raise error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa#');
      const e1subs = '  ^----------------------------!';
      const e2 = cold(' -                             ');
      const e2subs = '  ----^------------------------!';
      const expected = '----a------------------------#';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error as soon as just-throw duration is used', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----abcdefabcdefabcdefabcdefa|');
      const e1subs = '  ^---!-------------------------';
      const e2 = cold(' #                             ');
      const e2subs = '  ----(^!)                      ';
      const expected = '----(a#)                      ';

      const result = e1.pipe(throttle(() => e2));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should throttle using durations of varying lengths', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|   ');
      const e1subs = '  ^---------------------!   ';
      const e2 = [
        cold('          -----|                    '),
        cold('                ---|                '),
        cold('                    -------|        '),
        cold('                            --|     '),
        cold('                               ----|'),
      ];
      const e2subs = [
        '               ^----!                    ',
        '               ------^--!                ',
        '               ----------^------!        ',
        '               ------------------^-!     ',
        '               ---------------------^!   ',
      ];
      const expected = 'a-----a---a-------a--a|   ';

      let i = 0;
      const result = e1.pipe(throttle(() => e2[i++]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });

  it('should propagate error from duration Observable', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  abcdefabcdabcdefghabca|   ');
      const e1subs = '  ^----------------!        ';
      const e2 = [
        cold('          -----|                    '),
        cold('                ---|                '),
        cold('                    -------#        '),
      ];
      const e2subs = [
        '               ^----!                    ',
        '               ------^--!                ',
        '               ----------^------!        ',
      ];
      const expected = 'a-----a---a------#        ';

      let i = 0;
      const result = e1.pipe(throttle(() => e2[i++]));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      for (let j = 0; j < e2.length; j++) {
        expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
      }
    });
  });

  it('should propagate error thrown from durationSelector function', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const s1 = hot(' --^--x--x--x--x--x--x--e--x--x--x--|');
      const s1Subs = ' ^--------------------!              ';
      const n1 = cold('----|                               ');
      const n1Subs = [
        '              ---^---!                            ',
        '              ---------^---!                      ',
        '              ---------------^---!                ',
      ];
      const exp = '    ---x-----x-----x-----(e#)           ';

      let i = 0;
      const result = s1.pipe(
        throttle(() => {
          if (i++ === 3) {
            throw new Error('lol');
          }
          return n1;
        })
      );
      expectObservable(result).toBe(exp, undefined, new Error('lol'));
      expectSubscriptions(s1.subscriptions).toBe(s1Subs);
      expectSubscriptions(n1.subscriptions).toBe(n1Subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|');
      const subs = '    ^----!';
      const expected = '-----|';

      function durationSelector() {
        return cold('-----|');
      }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should raise error when source does not emit and raises error', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----#');
      const subs = '    ^----!';
      const expected = '-----#';

      function durationSelector() {
        return cold('-----|');
      }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should handle an empty source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |     ');
      const subs = '    (^!)  ';
      const expected = '|     ';

      function durationSelector() {
        return cold('-----|');
      }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should handle a never source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -     ');
      const subs = '    ^     ';
      const expected = '-     ';

      function durationSelector() {
        return cold('-----|');
      }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should handle a throw source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #     ');
      const subs = '    (^!)  ';
      const expected = '#     ';

      function durationSelector() {
        return cold('-----|');
      }

      expectObservable(e1.pipe(throttle(durationSelector))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  describe('throttle(fn, { leading: true, trailing: true })', () => {
    it('should immediately emit the first value in each time window', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-xy-----b--x--cxxx------|');
        const e1subs = '  ^-------------------------!';
        const e2 = cold('  ----x                     ');
        const e2subs = [
          '               -^---!                     ',
          '               -----^---!                 ',
          '               ----------^---!            ',
          '               --------------^---!        ',
          '               ------------------^---!    ',
          '               ----------------------^---!',
        ];
        const expected = '-a---y----b---x---x---x---|';

        const result = e1.pipe(throttle(() => e2, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should work for individual values', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const s1 = hot('-^-x------------------|     ');
        const s1Subs = ' ^--------------------!     ';
        const n1 = cold('  ------------------------|');
        const n1Subs = ['--^------------------!     '];
        const exp = '    --x------------------|     ';

        const result = s1.pipe(throttle(() => n1, { leading: true, trailing: true }));
        expectObservable(result).toBe(exp);
        expectSubscriptions(s1.subscriptions).toBe(s1Subs);
        expectSubscriptions(n1.subscriptions).toBe(n1Subs);
      });
    });

    it('should emit trailing value after throttle duration when source completes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--------xy|     ');
        const e1subs = '  ^-----------!     ';
        const e2 = cold('  ----x            ');
        const e2subs = [
          // because prettier
          '               -^---!            ',
          '               ----------^---!   ',
        ];
        const expected = '-a--------x---(y|)';

        const result = e1.pipe(throttle(() => e2, { leading: true, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });
  });

  describe('throttle(fn, { leading: false, trailing: true })', () => {
    it('should immediately emit the first value in each time window', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-xy-----b--x--cxxx------|');
        const e1subs = '  ^-------------------------!';
        const e2 = cold('  ----x                     ');
        const e2subs = [
          '               -^---!                     ',
          '               -----^---!                 ',
          '               ----------^---!            ',
          '               --------------^---!        ',
          '               ------------------^---!    ',
          '               ----------------------^---!',
        ];
        const expected = '-----y--------x---x---x---|';

        const result = e1.pipe(throttle(() => e2, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should work for individual values', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const s1 = hot('-^-x------------------|        ');
        const s1Subs = ' ^--------------------!        ';
        const n1 = cold('  ------------------------x   ');
        const n1Subs = ['--^-----------------------!   '];
        const exp = '    --------------------------(x|)';

        const result = s1.pipe(throttle(() => n1, { leading: false, trailing: true }));
        expectObservable(result).toBe(exp);
        expectSubscriptions(s1.subscriptions).toBe(s1Subs);
        expectSubscriptions(n1.subscriptions).toBe(n1Subs);
      });
    });

    it('should wait for trailing throttle before completing, even if source completes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = hot('  -^--x--------y---------|        ');
        const sourceSubs = '   ^---------------------!        ';
        const duration = cold('   ------------------------x   ');
        const durationSubs = ' ---^-----------------------!   ';
        const exp = '          ---------------------------(y|)';

        const result = source.pipe(throttle(() => duration, { leading: false, trailing: true }));
        expectObservable(result).toBe(exp);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        expectSubscriptions(duration.subscriptions).toBe(durationSubs);
      });
    });

    it('should emit trailing value after throttle duration when source completes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--------x|   ');
        const e1subs = '  ^----------!   ';
        const e2 = cold('  ----x         ');
        const e2subs = [
          // because prettier
          '               -^---!         ',
          '               -----^---!     ',
          '               ----------^---!',
        ];
        const expected = '-----a--------(x|)';

        const result = e1.pipe(throttle(() => e2, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should emit the last trailing value after throttle duration when source completes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a--------xy|  ');
        const e1subs = '  ^-----------!  ';
        const e2 = cold('  ----x         ');
        const e2subs = [
          // because prettier
          '               -^---!         ',
          '               -----^---!     ',
          '               ----------^---!',
        ];
        const expected = '-----a--------(y|)';

        const result = e1.pipe(throttle(() => e2, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should complete when source completes if no value is available', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  -a-----|');
        const e1subs = '  ^------!';
        const e2 = cold('  ----x  ');
        const e2subs = [
          // because prettier
          '               -^---!  ',
          '               -----^-!',
        ];
        const expected = '-----a-|';

        const result = e1.pipe(throttle(() => e2, { leading: false, trailing: true }));

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });
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

    synchronousObservable
      .pipe(
        throttle(() => of(0)),
        take(3)
      )
      .subscribe(() => {
        /* noop */
      });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
