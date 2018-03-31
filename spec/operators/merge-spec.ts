import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;
const queueScheduler = Rx.Scheduler.queue;

/** @test {smoosh} */
describe('Observable.prototype.smoosh', () => {
  asDiagram('smoosh')('should handle merging two hot observables', () => {
    const e1 =    hot('--a-----b-----c----|');
    const e1subs =    '^                  !';
    const e2 =    hot('-----d-----e-----f---|');
    const e2subs =    '^                    !';
    const expected =  '--a--d--b--e--c--f---|';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh a source with a second', (done) => {
    const a = Observable.of(1, 2, 3);
    const b = Observable.of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    a.smoosh(b).subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should smoosh an immediately-scheduled source with an immediately-scheduled second', (done) => {
    const a = Observable.of<number>(1, 2, 3, queueScheduler);
    const b = Observable.of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    a.smoosh(b, queueScheduler).subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should smoosh cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^                      !';
    const expected = '---a--x--b--y--c--z----|';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh hot and hot', () => {
    const e1 =  hot('---a---^-b-----c----|');
    const e1subs =         '^            !';
    const e2 =  hot('-----x-^----y-----z----|');
    const e2subs =         '^               !';
    const expected =       '--b--y--c--z----|';

    const result = e1.smoosh(e2, rxTestScheduler);

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

    const result = e1.smoosh(e2, rxTestScheduler);

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

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =    hot('--a-----b-----c----|  ');
    const e1subs =    '^         !           ';
    const e2 =    hot('-----d-----e-----f---|');
    const e2subs =    '^         !           ';
    const expected =  '--a--d--b--           ';
    const unsub =     '          !           ';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =    hot('--a-----b-----c----|  ');
    const e1subs =    '^         !           ';
    const e2 =    hot('-----d-----e-----f---|');
    const e2subs =    '^         !           ';
    const expected =  '--a--d--b--           ';
    const unsub =     '          !           ';

    const result = e1
      .map((x) => x)
      .smoosh(e2, rxTestScheduler)
      .map((x) => x);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh empty and empty', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';

    const result = e1.smoosh(e2, rxTestScheduler);

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

    const result = e1.smoosh(e2, e3, rxTestScheduler);

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

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh never and never', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('-');
    const e2subs =  '^';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh empty and throw', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh hot and throw', () => {
    const e1 = hot( '--a--b--c--|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh never and throw', () => {
    const e1 = cold('-');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should smoosh empty and eventual error', () => {
    const e1 = cold(  '|');
    const e1subs =    '(^!)    ';
    const e2 =    hot('-------#');
    const e2subs =    '^      !';
    const expected =  '-------#';

    const result = e1.smoosh(e2, rxTestScheduler);

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

    const result = e1.smoosh(e2, rxTestScheduler);

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

    const result = e1.smoosh(e2, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});

describe('Observable.prototype.smooshAll', () => {
  it('should smoosh two observables', (done) => {
    const a = Observable.of(1, 2, 3);
    const b = Observable.of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    Observable.of(a, b).smooshAll().subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, null, done);
  });

  it('should smoosh two immediately-scheduled observables', (done) => {
    const a = Observable.of<number>(1, 2, 3, queueScheduler);
    const b = Observable.of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    Observable.of(a, b, queueScheduler).smooshAll().subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, null, done);
  });
});
