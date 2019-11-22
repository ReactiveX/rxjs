import { expect } from 'chai';
import { of, Observable } from 'rxjs';
import { concatWith, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals, NO_SUBS } from '../helpers/test-helper';

/** @test {concat} */
describe('concat operator', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(assertDeepEquals);
  });

  it('should concatenate two cold observables', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const e1 = cold(' --a--b-|');
      const e2 = cold('        --x---y--|');
      const expected = '--a--b---x---y--|';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
    });
  });

  it('should work properly with scalar observables', done => {
    const results: string[] = [];

    const s1 = new Observable<number>(observer => {
      setTimeout(() => {
        observer.next(1);
        observer.complete();
      });
    }).pipe(concatWith(of(2)));

    s1.subscribe(
      x => {
        results.push('Next: ' + x);
      },
      x => {
        done(new Error('should not be called'));
      },
      () => {
        results.push('Completed');
        expect(results).to.deep.equal(['Next: 1', 'Next: 2', 'Completed']);
        done();
      }
    );
  });

  it('should complete without emit if both sources are empty', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --|');
      const e1subs = '  ^-!';
      const e2 = cold('   ----|');
      const e2subs = '  --^---!';
      const expected = '------|';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if first source does not completes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---');
      const e1subs = '  ^--';
      const e2 = cold('    --|');
      const e2subs = NO_SUBS;
      const expected = '---';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if second source does not completes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --|');
      const e1subs = '  ^-!';
      const e2 = cold('   ---');
      const e2subs = '  --^--';
      const expected = '-----';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if both sources do not complete', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---');
      const e1subs = '  ^--';
      const e2 = cold('    ---');
      const e2subs = NO_SUBS;
      const expected = '---';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error when first source is empty, second source raises error', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --|');
      const e1subs = '  ^-!';
      const e2 = cold('   ----#');
      const e2subs = '  --^---!';
      const expected = '------#';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error when first source raises error, second source is empty', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---#');
      const e1subs = '  ^--!';
      const e2 = cold('    ----|');
      const expected = '---#';
      const e2subs = NO_SUBS;

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise first error when both source raise error', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---#');
      const e1subs = '  ^--!';
      const e2 = cold('    ------#');
      const expected = '---#';
      const e2subs = NO_SUBS;

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should concat if first source emits once, second source is empty', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--|');
      const e1subs = '  ^----!';
      const e2 = cold('      --------|');
      const e2subs = '  -----^-------!';
      const expected = '--a----------|';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should concat if first source is empty, second source emits once', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --|');
      const e1subs = '  ^-!';
      const e2 = cold('   --a--|');
      const e2subs = '  --^----!';
      const expected = '----a--|';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit element from first source, and should not complete if second ' + 'source does not completes', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--|');
      const e1subs = '  ^----!';
      const e2 = cold('      ---');
      const e2subs = '  -----^--';
      const expected = '--a-----';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not complete if first source does not complete', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---');
      const e1subs = '  ^--';
      const e2 = cold('    --a--|');
      const e2subs = NO_SUBS;
      const expected = '---';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit elements from each source when source emit once', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a|');
      const e1subs = '  ^---!';
      const e2 = cold('     -----b--|');
      const e2subs = '  ----^-------!';
      const expected = '---a-----b--|';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should unsubscribe to inner source if outer is unsubscribed early', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  ---a-a--a|            ');
      const e1subs = '   ^--------!            ';
      const e2 = cold('           -----b-b--b-|');
      const e2subs = '   ---------^-------!';
      const unsub = '    -----------------!  ';
      const expected = ' ---a-a--a-----b-b     ';

      expectObservable(e1.pipe(concatWith(e2)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-a--a|            ');
      const e1subs = '  ^--------!            ';
      const e2 = cold('          -----b-b--b-|');
      const e2subs = '  ---------^--------!    ';
      const expected = '---a-a--a-----b-b-    ';
      const unsub = '   ------------------!    ';

      const result = e1.pipe(
        mergeMap(x => of(x)),
        concatWith(e2),
        mergeMap(x => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should raise error from first source and does not emit from second source', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --#');
      const e1subs = '  ^-!';
      const e2 = cold('   ----a--|');
      const e2subs = NO_SUBS;
      const expected = '--#';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit element from first source then raise error from second source', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a--|');
      const e1subs = '  ^----!';
      const e2 = cold('      -------#');
      const e2subs = '  -----^------!';
      const expected = '--a---------#';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it(
    'should emit all elements from both hot observable sources if first source ' +
      'completes before second source starts emit',
    () => {
      rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  --a--b-|');
        const e1subs = '  ^------!';
        const e2 = hot('  --------x--y--|');
        const e2subs = '  -------^------!';
        const expected = '--a--b--x--y--|';

        expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    }
  );

  it(
    'should emit elements from second source regardless of completion time ' + 'when second source is cold observable',
    () => {
      rxTest.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  --a--b--c---|');
        const e1subs = '  ^-----------!';
        const e2 = cold('           -x-y-z-|');
        const e2subs = '  ------------^------!';
        const expected = '--a--b--c----x-y-z-|';

        expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    }
  );

  it('should not emit collapsing element from second source', () => {
    rxTest.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^----------!';
      const e2 = hot('  --------x--y--z--|');
      const e2subs = '  -----------^-----!';
      const expected = '--a--b--c--y--z--|';

      expectObservable(e1.pipe(concatWith(e2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should emit self without parameters', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-|');
      const e1subs = '  ^----!';
      const expected = '---a-|';

      expectObservable(e1.pipe(concatWith())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
