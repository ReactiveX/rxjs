import { expect } from 'chai';
import { lowerCaseO } from '../helpers/test-helper';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { TestScheduler } from 'rxjs/testing';
import { merge, of, Observable, defer, asyncScheduler } from 'rxjs';
import { delay } from 'rxjs/operators';

declare const rxTestScheduler: TestScheduler;

/** @test {merge} */
describe('static merge(...observables)', () => {
  it('should merge cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^                      !';
    const expected = '---a--x--b--y--c--z----|';

    const result = merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should return itself when try to merge single observable', () => {
    const e1 = of('a');
    const result = merge(e1);

    expect(e1).to.equal(result);
  });

  it('should merge hot and hot', () => {
    const e1 =  hot('---a---^-b-----c----|');
    const e1subs =         '^            !';
    const e2 =  hot('-----x-^----y-----z----|');
    const e2subs =         '^               !';
    const expected =       '--b--y--c--z----|';

    const result = merge(e1, e2);

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

    const result = merge(e1, e2);

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

    const result = merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and empty', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';

    const result = merge(e1, e2);

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

    const result = merge(e1, e2, e3);

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

    const result = merge(e1, e2);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and never', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('-');
    const e2subs =  '^';

    const result = merge(e1, e2);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and throw', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = merge(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and throw', () => {
    const e1 = hot('--a--b--c--|');
    const e1subs = '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = merge(e1, e2);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and throw', () => {
    const e1 = cold('-');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = merge(e1, e2);

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

    const result = merge(e1, e2);

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

    const result = merge(e1, e2);

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

    const result = merge(e1, e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge single lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');

    const result = merge(e1);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });

  it('should merge two lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');
    const e2 = lowerCaseO('d', 'e', 'f');

    const result = merge(e1, e2);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abcdef|)');
  });
});

describe('merge(...observables, Scheduler)', () => {
  it('should merge single lowerCaseO into RxJS Observable', () => {
    const e1 = lowerCaseO('a', 'b', 'c');

    const result = merge(e1, rxTestScheduler);

    expect(result).to.be.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });
});

describe('merge(...observables, Scheduler, number)', () => {
  it('should handle concurrency limits', () => {
    const e1 =  cold('---a---b---c---|');
    const e2 =  cold('-d---e---f--|');
    const e3 =  cold(            '---x---y---z---|');
    const expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(merge(e1, e2, e3, 2)).toBe(expected);
  });

  it('should handle scheduler', () => {
    const e1 =  of('a');
    const e2 =  of('b').pipe(delay(20, rxTestScheduler));
    const expected = 'a-(b|)';

    expectObservable(merge(e1, e2, rxTestScheduler)).toBe(expected);
  });

  it('should handle scheduler with concurrency limits', () => {
    const e1 =  cold('---a---b---c---|');
    const e2 =  cold('-d---e---f--|');
    const e3 =  cold(            '---x---y---z---|');
    const expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(merge(e1, e2, e3, 2, rxTestScheduler)).toBe(expected);
  });

  it('should use the scheduler even when one Observable is merged', (done) => {
    let e1Subscribed = false;
    const e1 = defer(() => {
      e1Subscribed = true;
      return of('a');
    });

    merge(e1, asyncScheduler)
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
