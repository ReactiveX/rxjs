import { expect } from 'chai';
import { takeWhile, tap, mergeMap } from 'rxjs/operators';
import { of, Observable, from } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {takeWhile} */
describe('takeWhile operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  // asDiagram('takeWhile(x => x < 4)')
  it('should take all elements until predicate is false', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('-1-^2--3--4--5--6--|');
      const sourceSubs =    '^      !         ';
      const expected =      '-2--3--|         ';

      const result = source.pipe(takeWhile((v: any) => +v < 4));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(source).toBe(sourceSubs);
    });
  });

  it('should take all elements with predicate returns true', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^             !';
      const expected =   '--b--c--d--e--|';

      expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take all elements with truthy predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^             !';
      const expected =   '--b--c--d--e--|';

      expectObservable(e1.pipe(takeWhile(<any>(() => { return {}; })))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip all elements with predicate returns false', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^ !            ';
      const expected =   '--|            ';

      expectObservable(e1.pipe(takeWhile(() => false))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should skip all elements with falsy predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^ !            ';
      const expected =   '--|            ';

      expectObservable(e1.pipe(takeWhile(() => null))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take all elements until predicate return false', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^       !      ';
      const expected =   '--b--c--|      ';

      function predicate(value: string) {
        return value !== 'd';
      }

      expectObservable(e1.pipe(takeWhile(predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take elements with predicate when source does not complete', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--');
      const e1subs =     '^             ';
      const expected =   '--b--c--d--e--';

      expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not complete when source never completes', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('-');
      const e1subs =   '^';
      const expected = '-';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should complete when source does not emit', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^------------|');
      const e1subs =     '^            !';
      const expected =   '-------------|';

      expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should complete when source is empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('|');
      const e1subs =   '(^!)';
      const expected = '|';

      const result = e1.pipe(takeWhile(() => true));

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should pass element index to predicate', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^       !      ';
      const expected =   '--b--c--|      ';

      function predicate(value: string, index: number) {
        return index < 2;
      }

      expectObservable(e1.pipe(takeWhile(predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--#');
      const e1subs =     '^             !';
      const expected =   '--b--c--d--e--#';

      expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error when source throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = cold('#');
      const subs =        '(^!)';
      const expected =    '#';

      expectObservable(source.pipe(takeWhile(() => true))).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
    });
  });

  it('should invoke predicate until return false', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^       !      ';
      const expected =   '--b--c--|      ';

      let invoked = 0;
      function predicate(value: string) {
        invoked++;
        return value !== 'd';
      }

      const source = e1.pipe(
        takeWhile(predicate),
        tap(null, null, () => {
          expect(invoked).to.equal(3);
        })
      );
      expectObservable(source).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should raise error if predicate throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const e1subs =     '^ !            ';
      const expected =   '--#            ';

      function predicate(value: string) {
        throw 'error';
      }

      expectObservable(e1.pipe(takeWhile(<any>predicate))).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should take elements until unsubscribed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const unsub =      '-----!         ';
      const e1subs =     '^    !         ';
      const expected =   '--b---         ';

      function predicate(value: string) {
        return value !== 'd';
      }

      expectObservable(e1.pipe(takeWhile(predicate)), unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a-^-b--c--d--e--|');
      const unsub =      '-----!         ';
      const e1subs =     '^    !         ';
      const expected =   '--b---         ';

      function predicate(value: string) {
        return value !== 'd';
      }

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        takeWhile(predicate),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
    });
  });

  it('should not break the subscription chain', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--^-----a-b-|');
      const subs =         '^       !  ';
      const inner = cold('        -----x|');
      const innerSubs =    '      ^     ';
      const expected =   '  -----------x|';
      const tested = source.pipe(
        takeWhile(x => x !== 'b'),
        mergeMap(() => inner),
      );

      expectObservable(tested).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
      expectSubscriptionsTo(inner).toBe(innerSubs);
    });
  });

  it('should not break the subscription chain for early unsubscription', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--^-----a-b-|');
      const subs =         '^    !     ';
      const inner = cold('        -----x|');
      const innerSubs =    '           ';
      const expected =   '  -----      ';
      const tested = source.pipe(
        takeWhile(x => x !== 'b'),
        mergeMap(() => inner),
      );

      expectObservable(tested, subs).toBe(expected);
      expectSubscriptionsTo(source).toBe(subs);
      expectSubscriptionsTo(inner).toBe(innerSubs);
    });
  });
});
