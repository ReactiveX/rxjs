import { of, EMPTY } from 'rxjs';
import { delayWhen, tap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { expect } from 'chai';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {delayWhen} */
describe('delayWhen operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('delayWhen(durationSelector)')
  it('should delay by duration selector', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('---a---b---c--|');
      const expected =      '-----a------c----(b|)';
      const subs =          '^             !';
      const selector = [cold(  '--x--|'),
                        cold(      '----------(x|)'),
                        cold(          '-x--|')];
      const selectorSubs = ['   ^ !            ',
                            '       ^         !',
                            '           ^!     '];

      let idx = 0;
      function durationSelector(x: any) {
        return selector[idx++];
      }

      const result = e1.pipe(delayWhen(durationSelector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector[0]).toBe(selectorSubs[0]);
      expectSubscriptionsTo(selector[1]).toBe(selectorSubs[1]);
      expectSubscriptionsTo(selector[2]).toBe(selectorSubs[2]);
    });
  });

  it('should delay by selector', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '---a--b-|';
      const subs =          '^       !';
      const selector = cold(  '-x--|');
      const selectorSubs = ['  ^!     ',
                            '     ^!  '];

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should raise error if source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--#');
      const expected =      '---a-#';
      const subs =          '^    !';
      const selector = cold(  '-x--|');
      const selectorSubs =  '  ^!     ';

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should raise error if selector raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '---#';
      const subs =          '^  !';
      const selector = cold(  '-#');
      const selectorSubs =  '  ^!     ';

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should delay by selector and completes after value emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '---------a--(b|)';
      const subs =          '^       !';
      const selector = cold('-------x--|');
      const selectorSubs = ['  ^      !',
                            '     ^      !'];

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should delay by selector completes if selector does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '------a--(b|)';
      const subs =          '^       !';
      const selector = cold(  '----|');
      const selectorSubs = ['  ^   !',
                            '     ^   !'];

      const result = e1.pipe(delayWhen(() => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should emit if the selector completes synchronously', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('a--|');
      const expected =      'a--|';
      const subs =          '^  !';

      const result = e1.pipe(delayWhen((x: any) => EMPTY));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should emit if the source completes synchronously and the selector completes synchronously', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('(a|)');
      const expected =      '(a|)';
      const subs =          '(^!)';

      const result = e1.pipe(delayWhen((x: any) => EMPTY));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should not emit if selector never emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '-';
      const subs =          '^       !';
      const selector = cold(  '-');
      const selectorSubs = ['  ^      ',
                            '     ^   '];

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should delay by first value from selector', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '------a--(b|)';
      const subs =          '^       !';
      const selector = cold(  '----x--y--|');
      const selectorSubs = ['  ^   !',
                            '     ^   !'];

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should delay by selector does not completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '------a--(b|)';
      const subs =          '^       !';
      const selector = cold(  '----x-----y---');
      const selectorSubs = ['  ^   !',
                            '     ^   !'];

      const result = e1.pipe(delayWhen((x: any) => selector));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
    });
  });

  it('should raise error if selector throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('--a--b--|');
      const expected =      '--#';
      const subs =          '^ !';

      const err = new Error('error');
      const result = e1.pipe(delayWhen(() => { throw err; }));

      expectObservable(result).toBe(expected, null, err);
      expectSubscriptionsTo(e1).toBe(subs);
    });
  });

  it('should start subscription when subscription delay emits', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('-----a---b---|');
      const expected =      '-------a---b-|';
      const subs =          '  ^          !';
      const selector = cold(     '--x--|');
      const selectorSubs = ['     ^ !',
                            '         ^ !'];
      const subDelay = cold('--x--|');
      const subDelaySub =   '^ !';

      const result = e1.pipe(delayWhen(() => selector, subDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
      expectSubscriptionsTo(subDelay).toBe(subDelaySub);
    });
  });

  it('should start subscription when subscription delay completes without emitting a value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('-----a---b---|');
      const expected =      '-------a---b-|';
      const subs =          '  ^          !';
      const selector = cold(     '--x--|');
      const selectorSubs = ['     ^ !',
                            '         ^ !'];
      const subDelay = cold('--|');
      const subDelaySub =   '^ !';

      const result = e1.pipe(delayWhen(() => selector, subDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(subs);
      expectSubscriptionsTo(selector).toBe(selectorSubs);
      expectSubscriptionsTo(subDelay).toBe(subDelaySub);
    });
  });

  it('should raise error when subscription delay raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =        hot('-----a---b---|');
      const expected =      '---#          ';
      const selector = cold(     '--x--|');
      const subDelay = cold('---#');
      const subDelaySub =   '^  !';

      const result = e1.pipe(delayWhen(x => selector, subDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe([]);
      expectSubscriptionsTo(selector).toBe([]);
      expectSubscriptionsTo(subDelay).toBe(subDelaySub);
    });
  });

  it('should complete when duration selector returns synchronous observable', () => {
    let next: boolean = false;
    let complete: boolean = false;

    of(1).pipe(
      delayWhen(() => of(2))
    ).subscribe(() => next = true, null, () => complete = true);

    expect(next).to.be.true;
    expect(complete).to.be.true;
  });

  it('should call predicate with indices starting at 0', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =    hot('--a--b--c--|');
      const expected =  '--a--b--c--|';
      const selector = cold('(x|)');

      let indices: number[] = [];
      const predicate = (value: string, index: number) => {
        indices.push(index);
        return selector;
      };

      const result = e1.pipe(delayWhen(predicate));

      expectObservable(result.pipe(
        tap(null, null, () => {
          expect(indices).to.deep.equal([0, 1, 2]);
        })
      )).toBe(expected);
    });
  });
});
