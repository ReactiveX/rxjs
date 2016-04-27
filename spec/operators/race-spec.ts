import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {race} */
describe('Observable.prototype.race', () => {
  it('should race cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----b-----c----|';

    const result = e1.race(e2);

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

    const result = e1.race(e2);

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

    const result = e1.race(e2);

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

    const result = e1.race(e2);

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

    const result = e1.race(e2);

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

    const result = e1.race(e2);

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

    const result = e1
      .mergeMap((x: string) => Observable.of(x, Rx.Scheduler.none))
      .race(e2)
      .mergeMap((x: string) => Observable.of(x, Rx.Scheduler.none));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should never emit when given non emitting sources', () => {
    const e1 =  cold('---|');
    const e2 =  cold('---|');
    const e1subs =   '^  !';
    const expected = '---|';

    const source = e1.race(e2);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should throw when error occurs mid stream', () => {
    const e1 =  cold('---a-----#');
    const e1subs =   '^        !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^  !';
    const expected = '---a-----#';

    const result = e1.race(e2);

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

    const result = e1.race(e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow observable emits immediately', (done: MochaDone) => {
    const e1 = Observable.of(true);
    const e2 = Observable.timer(200).map(_ => false);

    Observable.race(e1, e2).subscribe(x => {
      expect(x).to.be.true;
    }, done, done);
  });
});
