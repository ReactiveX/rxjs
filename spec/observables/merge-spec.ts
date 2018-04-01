import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { lowerCaseO } from '../helpers/test-helper';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {smoosh} */
describe('Observable.smoosh(...observables)', () => {
  it('should smoosh cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^                      !';
    const expected = '---a--x--b--y--c--z----|';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should return itself when try to smoosh single observable', () => {
    const e1 = Observable.of('a');
    const result = Observable.smoosh(e1);

    expect(e1).to.equal(result);
  });

  it('should smoosh hot and hot', () => {
    const e1 =  hot('---a---^-b-----c----|');
    const e1subs =         '^            !';
    const e2 =  hot('-----x-^----y-----z----|');
    const e2subs =         '^               !';
    const expected =       '--b--y--c--z----|';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh hot and cold', () => {
    const e1 =  hot('---a-^---b-----c----|');
    const e1subs =       '^              !';
    const e2 =  cold(    '--x-----y-----z----|');
    const e2subs =       '^                  !';
    const expected =     '--x-b---y-c---z----|';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh parallel emissions', () => {
    const e1 =   hot('---a----b----c----|');
    const e1subs =   '^                 !';
    const e2 =   hot('---x----y----z----|');
    const e2subs =   '^                 !';
    const expected = '---(ax)-(by)-(cz)-|';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh empty and empty', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe('|');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh three empties', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';
    const e3 = cold('|');
    const e3subs = '(^!)';

    const result = Observable.smoosh(e1, e2, e3);

    expectObservable(result).toBe('|');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should smoosh never and empty', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('|');
    const e2subs =  '(^!)';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh never and never', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('-');
    const e2subs =  '^';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh empty and throw', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh hot and throw', () => {
    const e1 = hot('--a--b--c--|');
    const e1subs = '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh never and throw', () => {
    const e1 = cold('-');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh empty and eventual error', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 =    hot('-------#');
    const e2subs =    '^------!';
    const expected =  '-------#';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh hot and error', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^      !    ';
    const e2 =   hot('-------#    ');
    const e2subs =   '^      !    ';
    const expected = '--a--b-#    ';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh never and error', () => {
    const e1 = hot(   '-');
    const e1subs =    '^      !';
    const e2 =    hot('-------#');
    const e2subs =    '^      !';
    const expected =  '-------#';

    const result = Observable.smoosh(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh single lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');

    const result = Observable.smoosh(e1);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });

  it('should smoosh two lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');
    const e2 = lowerCaseO('d', 'e', 'f');

    const result = Observable.smoosh(e1, e2);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abcdef|)');
  });
});

describe('Observable.smoosh(...observables, Scheduler)', () => {
  it('should smoosh single lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');

    const result = Observable.smoosh(e1, rxTestScheduler);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });
});

describe('Observable.smoosh(...observables, Scheduler, number)', () => {
  it('should handle concurrency limits', () => {
    const e1 =  cold('---a---b---c---|');
    const e2 =  cold('-d---e---f--|');
    const e3 =  cold(            '---x---y---z---|');
    const expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(Observable.smoosh(e1, e2, e3, 2)).toBe(expected);
  });

  it('should handle scheduler', () => {
    const e1 =  Observable.of('a');
    const e2 =  Observable.of('b').delay(20, rxTestScheduler);
    const expected = 'a-(b|)';

    expectObservable(Observable.smoosh(e1, e2, rxTestScheduler)).toBe(expected);
  });

  it('should handle scheduler with concurrency limits', () => {
    const e1 =  cold('---a---b---c---|');
    const e2 =  cold('-d---e---f--|');
    const e3 =  cold(            '---x---y---z---|');
    const expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(Observable.smoosh(e1, e2, e3, 2, rxTestScheduler)).toBe(expected);
  });

  it('should use the scheduler even when one Observable is smooshed', (done) => {
    let e1Subscribed = false;
    const e1 = Observable.defer(() => {
      e1Subscribed = true;
      return Observable.of('a');
    });

    Observable
      .smoosh(e1, Rx.Scheduler.async)
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
