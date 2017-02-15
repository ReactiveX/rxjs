import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import {lowerCaseO} from '../helpers/test-helper';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {merge} */
describe('Observable.merge(...observables)', () => {
  it('should merge cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^                      !';
    const expected = '---a--x--b--y--c--z----|';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should return itself when try to merge single observable', () => {
    const e1 = Observable.of('a');
    const result = Observable.merge(e1);

    expect(e1).to.equal(result);
  });

  it('should merge hot and hot', () => {
    const e1 =  hot('---a---^-b-----c----|');
    const e1subs =         '^            !';
    const e2 =  hot('-----x-^----y-----z----|');
    const e2subs =         '^               !';
    const expected =       '--b--y--c--z----|';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and cold', () => {
    const e1 =  hot('---a-^---b-----c----|');
    const e1subs =       '^              !';
    const e2 =  cold(    '--x-----y-----z----|');
    const e2subs =       '^                  !';
    const expected =     '--x-b---y-c---z----|';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge parallel emissions', () => {
    const e1 =   hot('---a----b----c----|');
    const e1subs =   '^                 !';
    const e2 =   hot('---x----y----z----|');
    const e2subs =   '^                 !';
    const expected = '---(ax)-(by)-(cz)-|';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and empty', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe('|');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge three empties', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';
    const e3 = cold('|');
    const e3subs = '(^!)';

    const result = Observable.merge(e1, e2, e3);

    expectObservable(result).toBe('|');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should merge never and empty', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('|');
    const e2subs =  '(^!)';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and never', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('-');
    const e2subs =  '^';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and throw', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and throw', () => {
    const e1 = hot('--a--b--c--|');
    const e1subs = '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and throw', () => {
    const e1 = cold('-');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and eventual error', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 =    hot('-------#');
    const e2subs =    '^------!';
    const expected =  '-------#';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and error', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^      !    ';
    const e2 =   hot('-------#    ');
    const e2subs =   '^      !    ';
    const expected = '--a--b-#    ';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and error', () => {
    const e1 = hot(   '-');
    const e1subs =    '^      !';
    const e2 =    hot('-------#');
    const e2subs =    '^      !';
    const expected =  '-------#';

    const result = Observable.merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge single lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');

    const result = Observable.merge(e1);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });

  it('should merge two lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');
    const e2 = lowerCaseO('d', 'e', 'f');

    const result = Observable.merge(e1, e2);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abcdef|)');
  });
});

describe('Observable.merge(...observables, Scheduler)', () => {
  it('should merge single lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');

    const result = Observable.merge(e1, rxTestScheduler);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });
});

describe('Observable.merge(...observables, Scheduler, number)', () => {
  it('should handle concurrency limits', () => {
    const e1 =  cold('---a---b---c---|');
    const e2 =  cold('-d---e---f--|');
    const e3 =  cold(            '---x---y---z---|');
    const expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(Observable.merge(e1, e2, e3, 2)).toBe(expected);
  });

  it('should handle scheduler', () => {
    const e1 =  Observable.of('a');
    const e2 =  Observable.of('b').delay(20, rxTestScheduler);
    const expected = 'a-(b|)';

    expectObservable(Observable.merge(e1, e2, rxTestScheduler)).toBe(expected);
  });

  it('should handle scheduler with concurrency limits', () => {
    const e1 =  cold('---a---b---c---|');
    const e2 =  cold('-d---e---f--|');
    const e3 =  cold(            '---x---y---z---|');
    const expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(Observable.merge(e1, e2, e3, 2, rxTestScheduler)).toBe(expected);
  });

  it('should use the scheduler even when one Observable is merged', (done: MochaDone) => {
    let e1Subscribed = false;
    const e1 = Observable.defer(() => {
      e1Subscribed = true;
      return Observable.of('a');
    });

    Observable
      .merge(e1, Rx.Scheduler.async)
      .subscribe({
        error: done,
        complete: () => {
          expect(e1Subscribed).to.be.true;
          done();
        }
      });

    expect(e1Subscribed).to.be.false;
  });
});
