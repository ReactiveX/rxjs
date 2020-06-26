import { of, Notification, ObservableNotification } from 'rxjs';
import { dematerialize, map, mergeMap, materialize } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

const NO_VALUES: { [key: string]: ObservableNotification<any> } = {};

/** @test {dematerialize} */
describe('dematerialize operator', () => {
  it('should dematerialize an Observable', () => {
    const values = {
      a: '{x}',
      b: '{y}',
      c: '{z}',
      d: '|'
    };

    const e1 =   hot('--a--b--c--d-|', values);
    const expected = '--x--y--z--|';

    const result = e1.pipe(
      map((x: string) => {
        if (x === '|') {
          return Notification.createComplete();
        } else {
          return Notification.createNext(x.replace('{', '').replace('}', ''));
        }
      }),
      dematerialize()
    );

    expectObservable(result).toBe(expected);
  });

  it('should dematerialize a happy stream', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x'),
      c: Notification.createNext('y'),
      d: Notification.createComplete()
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^          !';
    const expected = '--w--x--y--|';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize a sad stream', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x'),
      c: Notification.createNext('y'),
      d: Notification.createError('error')
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^          !';
    const expected = '--w--x--y--#';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream does not completes', () => {
    const e1 = hot('------', NO_VALUES);
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream never completes', () => {
    const e1 =  cold('-', NO_VALUES);
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream does not emit', () => {
    const e1 =   hot('----|', NO_VALUES);
    const e1subs =   '^   !';
    const expected = '----|';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize empty stream', () => {
    const e1 =  cold('|', NO_VALUES);
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream throws', () => {
    const error = 'error';
    const e1 =   hot('(x|)', {x: Notification.createError(error)});
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(dematerialize())).toBe(expected, null, error);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x')
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^      !       ';
    const expected = '--w--x--       ';
    const unsub =    '       !       ';

    const result = e1.pipe(dematerialize());

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x')
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^      !       ';
    const expected = '--w--x--       ';
    const unsub =    '       !       ';

    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      dematerialize(),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize and completes when stream completes with complete notification', () => {
    const e1 =   hot('----(a|)', { a: Notification.createComplete() });
    const e1subs =   '^   !';
    const expected = '----|';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize and completes when stream emits complete notification', () => {
    const e1 =   hot('----a--|', { a: Notification.createComplete() });
    const e1subs =   '^   !';
    const expected = '----|';

    expectObservable(e1.pipe(dematerialize())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with materialize', () => {
    const source = hot('----a--b---c---d---e----f--|');
    const expected = '----a--b---c---d---e----f--|';
    const result = source.pipe(
      materialize(),
      dematerialize()
    );
    expectObservable(result).toBe(expected);
  });
});
