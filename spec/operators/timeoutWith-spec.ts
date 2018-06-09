import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { timeoutWith, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

/** @test {timeoutWith} */
describe('timeoutWith operator', () => {
  asDiagram('timeoutWith(50)')('should timeout after a specified period then subscribe to the passed observable', () => {
    const e1 =  cold('-------a--b--|');
    const e1subs =   '^    !        ';
    const e2 =       cold('x-y-z-|  ');
    const e2subs =   '     ^     !  ';
    const expected = '-----x-y-z-|  ';

    const result = e1.pipe(timeoutWith(50, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout at a specified date then subscribe to the passed observable', () => {
    const e1 =  cold('-');
    const e1subs =   '^         !           ';
    const e2 = cold(           '--x--y--z--|');
    const e2subs =   '          ^          !';
    const expected = '------------x--y--z--|';

    const result = e1.pipe(timeoutWith(new Date(rxTestScheduler.now() + 100), e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout after a specified period between emit then subscribe ' +
  'to the passed observable when source emits', () => {
    const e1 =     hot('---a---b------c---|');
    const e1subs =     '^          !       ';
    const e2 = cold(              '-x-y-|  ');
    const e2subs =     '           ^    !  ';
    const expected =   '---a---b----x-y-|  ';

    const result = e1.pipe(timeoutWith(40, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =     hot('---a---b-----c----|');
    const e1subs =     '^          !       ';
    const e2 = cold(              '-x---y| ');
    const e2subs =     '           ^  !    ';
    const expected =   '---a---b----x--    ';
    const unsub =      '              !    ';

    const result = e1.pipe(timeoutWith(40, e2, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 =     hot('---a---b-----c----|');
    const e1subs =     '^          !       ';
    const e2 = cold(              '-x---y| ');
    const e2subs =     '           ^  !    ';
    const expected =   '---a---b----x--    ';
    const unsub =      '              !    ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      timeoutWith(40, e2, rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not subscribe to withObservable after explicit unsubscription', () => {
    const e1 =  cold('---a------b------');
    const e1subs =   '^    !           ';
    const e2 =  cold(        'i---j---|');
    const e2subs: string[] = [];
    const expected = '---a--           ';
    const unsub =    '     !           ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      timeoutWith(50, e2, rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout after a specified period then subscribe to the ' +
  'passed observable when source is empty', () => {
    const e1 =   hot('-------------|      ');
    const e1subs =   '^         !         ';
    const e2 = cold(           '----x----|');
    const e2subs =   '          ^        !';
    const expected = '--------------x----|';

    const result = e1.pipe(timeoutWith(100, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout after a specified period between emit then never completes ' +
  'if other source does not complete', () => {
    const e1 =   hot('--a--b--------c--d--|');
    const e1subs =   '^        !           ';
    const e2 =  cold('-');
    const e2subs =   '         ^           ';
    const expected = '--a--b----           ';

    const result = e1.pipe(timeoutWith(40, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout after a specified period then subscribe to the ' +
  'passed observable when source raises error after timeout', () => {
    const e1 =   hot('-------------#      ');
    const e1subs =   '^         !         ';
    const e2 =  cold(          '----x----|');
    const e2subs =   '          ^        !';
    const expected = '--------------x----|';

    const result = e1.pipe(timeoutWith(100, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout after a specified period between emit then never completes ' +
  'if other source emits but not complete', () => {
    const e1 =   hot('-------------|     ');
    const e1subs =   '^         !        ';
    const e2 =            cold('----x----');
    const e2subs =   '          ^        ';
    const expected = '--------------x----';

    const result = e1.pipe(timeoutWith(100, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not timeout if source completes within timeout period', () => {
    const e1 =   hot('-----|');
    const e1subs =   '^    !';
    const e2 = cold(           '----x----');
    const e2subs: string[] = [];
    const expected = '-----|';

    const result = e1.pipe(timeoutWith(100, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not timeout if source raises error within timeout period', () => {
    const e1 =   hot('-----#');
    const e1subs =   '^    !';
    const e2 = cold(           '----x----|');
    const e2subs: string[] = [];
    const expected = '-----#';

    const result = e1.pipe(timeoutWith(100, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not timeout if source emits within timeout period', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const e2 =  cold('----x----|');
    const e2subs: string[] = [];
    const expected = '--a--b--c--d--e--|';

    const result = e1.pipe(timeoutWith(50, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout after specified Date then subscribe to the passed observable', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^      !          ';
    const e2 =  cold(       '--z--|     ');
    const e2subs =   '       ^    !     ';
    const expected = '--a--b---z--|     ';

    const result = e1.pipe(timeoutWith(new Date(rxTestScheduler.now() + 70), e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not timeout if source completes within specified Date', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const e2 =  cold('--x--|');
    const e2subs: string[] = [];
    const expected = '--a--b--c--d--e--|';

    const timeoutValue = new Date(Date.now() + (expected.length + 2) * 10);

    const result = e1.pipe(timeoutWith(timeoutValue, e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not timeout if source raises error within specified Date', () => {
    const e1 =   hot('---a---#');
    const e1subs =   '^      !';
    const e2 =  cold('--x--|');
    const e2subs: string[] = [];
    const expected = '---a---#';

    const result = e1.pipe(timeoutWith(new Date(Date.now() + 100), e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should timeout specified Date after specified Date then never completes ' +
  'if other source does not complete', () => {
    const e1 =   hot('---a---b---c---d---e---|');
    const e1subs =   '^         !             ';
    const e2 =  cold('-');
    const e2subs =   '          ^             ';
    const expected = '---a---b---             ';

    const result = e1.pipe(timeoutWith(new Date(rxTestScheduler.now() + 100), e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe from the scheduled timeout action when timeout is unsubscribed early', () => {
    const e1 =     hot('---a---b-----c----|');
    const e1subs =     '^          !       ';
    const e2 = cold(              '-x---y| ');
    const e2subs =     '           ^  !    ';
    const expected =   '---a---b----x--    ';
    const unsub =      '              !    ';

    const result = e1
      .lift({
        call: (timeoutSubscriber, source) => {
          const { action } = <any> timeoutSubscriber; // get a ref to the action here
          timeoutSubscriber.add(() => {               // because it'll be null by the
            if (!action.closed) {                     // time we get into this function.
              throw new Error('TimeoutSubscriber scheduled action wasn\'t canceled');
            }
          });
          return source.subscribe(timeoutSubscriber);
        }
      })
      .pipe(timeoutWith(40, e2, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});
