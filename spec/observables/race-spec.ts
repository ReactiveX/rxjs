import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {race} */
describe('Observable.race', () => {
  it('should race a single observable', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const expected = '---a-----b-----c----|';

    const result = Observable.race(e1);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should race cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b-----c----|';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should race with array of observable', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b-----c----|';

    const result = Observable.race([e1, e2]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should race hot and hot', () => {
    const e1 =   hot('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =   hot('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b-----c----|';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should race hot and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =   hot('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b-----c----|';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should race 2nd and 1st', () => {
    const e1 =  cold('------x-----y-----z----|');
    const e1subs =   '^  !';
    const e2 =  cold('---a-----b-----c----|');
    const e2subs =   '^                   !';
    const expected = '---a-----b-----c----|';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should race emit and complete', () => {
    const e1 =  cold('-----|');
    const e1subs =   '^    !';
    const e2 =   hot('------x-----y-----z----|');
    const e2subs =   '^    !';
    const expected = '-----|';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^           !';
    const e2 =   hot('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b---';
    const unsub =    '            !';

    const result = Observable.race(e1, e2);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--^--b--c---d-| ');
    const e1subs =        '^        !    ';
    const e2 =   hot('---e-^---f--g---h-|');
    const e2subs =        '^  !    ';
    const expected =      '---b--c---    ';
    const unsub =         '         !    ';

    const result = Observable.race(
        e1.mergeMap((x: string) => Observable.of(x)),
        e2.mergeMap((x: string) => Observable.of(x))
    ).mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should never emit when given non emitting sources', () => {
    const e1 =  cold('---|');
    const e2 =  cold('---|');
    const e1subs =   '^  !';
    const expected = '---|';

    const source = Observable.race(e1, e2);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should throw when error occurs mid stream', () => {
    const e1 =  cold('---a-----#');
    const e1subs =   '^        !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----#';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should throw when error occurs before a winner is found', () => {
    const e1 =  cold('---#');
    const e1subs =   '^  !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---#';

    const result = Observable.race(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('handle empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const source = Observable.race(e1);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const source = Observable.race(e1);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const source = Observable.race(e1);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
