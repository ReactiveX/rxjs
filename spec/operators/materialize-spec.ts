import { materialize, map, mergeMap } from 'rxjs/operators';
import { Notification, of } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {materialize} */
describe('materialize operator', () => {
  asDiagram('materialize')('should materialize an Observable', () => {
    const e1 =   hot('--x--y--z--|');
    const expected = '--a--b--c--(d|)';
    const values = { a: '{x}', b: '{y}', c: '{z}', d: '|' };

    const result = e1.pipe(
      materialize(),
      map((x: Notification<any>) => {
        if (x.kind === 'C') {
          return '|';
        } else {
          return '{' + x.value + '}';
        }
      })
    );

    expectObservable(result).toBe(expected, values);
  });

  it('should materialize a happy stream', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^          !';
    const expected = '--w--x--y--(z|)';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createComplete()
    };

    expectObservable(e1.pipe(materialize())).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize a sad stream', () => {
    const e1 =   hot('--a--b--c--#');
    const e1subs =   '^          !';
    const expected = '--w--x--y--(z|)';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createError('error')
    };

    expectObservable(e1.pipe(materialize())).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--a--b--c--|');
    const unsub =    '      !     ';
    const e1subs =   '^     !     ';
    const expected = '--w--x-     ';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b')
    };

    expectObservable(e1.pipe(materialize()), unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^     !     ';
    const expected = '--w--x-     ';
    const unsub =    '      !     ';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b')
    };

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      materialize(),
      mergeMap((x: Notification<any>) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(materialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(materialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream does not emit', () => {
    const e1 =   hot('----|');
    const e1subs =   '^   !';
    const expected = '----(x|)';

    expectObservable(e1.pipe(materialize())).toBe(expected, { x: Notification.createComplete() });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize empty stream', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.pipe(materialize())).toBe(expected, { x: Notification.createComplete() });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.pipe(materialize())).toBe(expected, { x: Notification.createError('error') });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
