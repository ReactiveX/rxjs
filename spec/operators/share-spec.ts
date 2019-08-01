import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { share, retry, mergeMapTo, mergeMap, tap, repeat } from 'rxjs/operators';
import { Observable, EMPTY, NEVER, of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {share} */
describe('share operator', () => {
  asDiagram('share')('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const expected =    '--1-2---3-4--5-|';

    const shared = source.pipe(share());

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share a single subscription', () => {
    let subscriptionCount = 0;
    const obs = new Observable<never>(observer => {
      subscriptionCount++;
    });

    const source = obs.pipe(share());

    expect(subscriptionCount).to.equal(0);

    source.subscribe();
    source.subscribe();

    expect(subscriptionCount).to.equal(1);
  });

  it('should not change the output of the observable when error', () => {
    const e1 = hot('---a--^--b--c--d--e--#');
    const e1subs =       '^              !';
    const expected =     '---b--c--d--e--#';

    expectObservable(e1.pipe(share())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not change the output of the observable when successful with cold observable', () => {
    const e1 =  cold('---a--b--c--d--e--|');
    const e1subs =   '^                 !';
    const expected = '---a--b--c--d--e--|';

    expectObservable(e1.pipe(share())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not change the output of the observable when error with cold observable', () => {
    const e1 =  cold('---a--b--c--d--e--#');
    const e1subs =   '^                 !';
    const expected = '---a--b--c--d--e--#';

    expectObservable(e1.pipe(share())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should retry just fine', () => {
    const e1 =  cold('---a--b--c--d--e--#');
    const e1subs =  ['^                 !                  ',
                   '                  ^                 !'];
    const expected = '---a--b--c--d--e-----a--b--c--d--e--#';

    expectObservable(e1.pipe(share(), retry(1))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should share the same values to multiple observers', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^           !';
    const shared = source.pipe(share());
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
    const expected2   =     '    -3----4-|';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
    const expected3   =     '        --4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#');
    const sourceSubs =      '^           !';
    const shared = source.pipe(share());
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
    const expected2   =     '    -3----4-#';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
    const expected3   =     '        --4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share the same values to multiple observers, ' +
  'but is unsubscribed explicitly and early', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const shared = source.pipe(share());
    const unsub =           '         !   ';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
    const expected3   =     '        --   ';

    expectObservable(subscriber1, unsub).toBe(expected1);
    expectObservable(subscriber2, unsub).toBe(expected2);
    expectObservable(subscriber3, unsub).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const shared = source.pipe(share());
    const expected =    '|';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const shared = source.pipe(share());
    const expected =    '-';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should share a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const shared = source.pipe(share());
    const expected =    '#';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should connect when first subscriber subscribes', () => {
    const source = cold(       '-1-2-3----4-|');
    const sourceSubs =      '   ^           !';
    const shared = source.pipe(share());
    const subscriber1 = hot('   a|           ').pipe(mergeMapTo(shared));
    const expected1 =       '   -1-2-3----4-|';
    const subscriber2 = hot('       b|       ').pipe(mergeMapTo(shared));
    const expected2 =       '       -3----4-|';
    const subscriber3 = hot('           c|   ').pipe(mergeMapTo(shared));
    const expected3 =       '           --4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should disconnect when last subscriber unsubscribes', () => {
    const source =     cold(   '-1-2-3----4-|');
    const sourceSubs =      '   ^        !   ';
    const shared = source.pipe(share());
    const subscriber1 = hot('   a|           ').pipe(mergeMapTo(shared));
    const unsub1 =          '          !     ';
    const expected1   =     '   -1-2-3--     ';
    const subscriber2 = hot('       b|       ').pipe(mergeMapTo(shared));
    const unsub2 =          '            !   ';
    const expected2   =     '       -3----   ';

    expectObservable(subscriber1, unsub1).toBe(expected1);
    expectObservable(subscriber2, unsub2).toBe(expected2);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chain when last subscriber unsubscribes', () => {
    const source =     cold(   '-1-2-3----4-|');
    const sourceSubs =      '   ^        !   ';
    const shared = source.pipe(
      mergeMap((x: string) => of(x)),
      share(),
      mergeMap((x: string) => of(x))
    );
    const subscriber1 = hot('   a|           ').pipe(mergeMapTo(shared));
    const unsub1 =          '          !     ';
    const expected1   =     '   -1-2-3--     ';
    const subscriber2 = hot('       b|       ').pipe(mergeMapTo(shared));
    const unsub2 =          '            !   ';
    const expected2   =     '       -3----   ';

    expectObservable(subscriber1, unsub1).toBe(expected1);
    expectObservable(subscriber2, unsub2).toBe(expected2);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be retryable when cold source is synchronous', () => {
    const source = cold('(123#)');
    const shared = source.pipe(share());
    const subscribe1 =  's         ';
    const expected1 =   '(123123#) ';
    const subscribe2 =  ' s        ';
    const expected2 =   ' (123123#)';
    const sourceSubs = ['(^!)',
                      '(^!)',
                      ' (^!)',
                      ' (^!)'];

    expectObservable(hot(subscribe1).pipe(tap(() => {
      expectObservable(shared.pipe(retry(1))).toBe(expected1);
    }))).toBe(subscribe1);

    expectObservable(hot(subscribe2).pipe(tap(() => {
      expectObservable(shared.pipe(retry(1))).toBe(expected2);
    }))).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be repeatable when cold source is synchronous', () => {
    const source = cold('(123|)');
    const shared = source.pipe(share());
    const subscribe1 =  's         ';
    const expected1 =   '(123123|) ';
    const subscribe2 =  ' s        ';
    const expected2 =   ' (123123|)';
    const sourceSubs = ['(^!)',
                      '(^!)',
                      ' (^!)',
                      ' (^!)'];

    expectObservable(hot(subscribe1).pipe(tap(() => {
      expectObservable(shared.pipe(repeat(2))).toBe(expected1);
    }))).toBe(subscribe1);

    expectObservable(hot(subscribe2).pipe(tap(() => {
      expectObservable(shared.pipe(repeat(2))).toBe(expected2);
    }))).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be retryable', () => {
    const source =     cold('-1-2-3----4-#                        ');
    const sourceSubs =     ['^           !                        ',
                          '            ^           !            ',
                          '                        ^           !'];
    const shared = source.pipe(share());
    const subscribe1 =      's                                    ';
    const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-#';
    const subscribe2 =      '    s                                ';
    const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-#';

    expectObservable(hot(subscribe1).pipe(tap(() => {
      expectObservable(shared.pipe(retry(2))).toBe(expected1);
    }))).toBe(subscribe1);

    expectObservable(hot(subscribe2).pipe(tap(() => {
      expectObservable(shared.pipe(retry(2))).toBe(expected2);
    }))).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be repeatable', () => {
    const source =     cold('-1-2-3----4-|                        ');
    const sourceSubs =     ['^           !                        ',
                          '            ^           !            ',
                          '                        ^           !'];
    const shared = source.pipe(share());
    const subscribe1 =      's                                    ';
    const expected1 =       '-1-2-3----4--1-2-3----4--1-2-3----4-|';
    const subscribe2 =      '    s                                ';
    const expected2 =       '    -3----4--1-2-3----4--1-2-3----4-|';

    expectObservable(hot(subscribe1).pipe(tap(() => {
      expectObservable(shared.pipe(repeat(3))).toBe(expected1);
    }))).toBe(subscribe1);

    expectObservable(hot(subscribe2).pipe(tap(() => {
      expectObservable(shared.pipe(repeat(3))).toBe(expected2);
    }))).toBe(subscribe2);

    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not change the output of the observable when never', () => {
    const e1 = NEVER;
    const expected = '-';

    expectObservable(e1.pipe(share())).toBe(expected);
  });

  it('should not change the output of the observable when empty', () => {
    const e1 = EMPTY;
    const expected = '|';

    expectObservable(e1.pipe(share())).toBe(expected);
  });
});
