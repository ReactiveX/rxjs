import { expect } from 'chai';
import { merge, map, mergeAll } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { queueScheduler, of } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {merge} */
describe('merge operator', () => {
  asDiagram('merge')('should handle merging two hot observables', () => {
    const e1 =    hot('--a-----b-----c----|');
    const e1subs =    '^                  !';
    const e2 =    hot('-----d-----e-----f---|');
    const e2subs =    '^                    !';
    const expected =  '--a--d--b--e--c--f---|';

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge a source with a second', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    a.pipe(merge(b)).subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should merge an immediately-scheduled source with an immediately-scheduled second', (done) => {
    const a = of<number>(1, 2, 3, queueScheduler);
    const b = of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    a.pipe(merge(b, queueScheduler)).subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should merge cold and cold', () => {
    const e1 =  cold('---a-----b-----c----|');
    const e1subs =   '^                   !';
    const e2 =  cold('------x-----y-----z----|');
    const e2subs =   '^                      !';
    const expected = '---a--x--b--y--c--z----|';

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and hot', () => {
    const e1 =  hot('---a---^-b-----c----|');
    const e1subs =         '^            !';
    const e2 =  hot('-----x-^----y-----z----|');
    const e2subs =         '^               !';
    const expected =       '--b--y--c--z----|';

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(
      map((x) => x),
      merge(e2, rxTestScheduler),
      map((x) => x)
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and empty', () => {
    const e1 = cold('|');
    const e1subs = '(^!)';
    const e2 = cold('|');
    const e2subs = '(^!)';

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, e3, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and never', () => {
    const e1 = cold('-');
    const e1subs =  '^';
    const e2 = cold('-');
    const e2subs =  '^';

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe('-');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and throw', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge hot and throw', () => {
    const e1 = hot( '--a--b--c--|');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge never and throw', () => {
    const e1 = cold('-');
    const e1subs =  '(^!)';
    const e2 = cold('#');
    const e2subs =  '(^!)';

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe('#');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should merge empty and eventual error', () => {
    const e1 = cold(  '|');
    const e1subs =    '(^!)    ';
    const e2 =    hot('-------#');
    const e2subs =    '^      !';
    const expected =  '-------#';

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, rxTestScheduler));

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

    const result = e1.pipe(merge(e2, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});

describe('mergeAll operator', () => {
  it('should merge two observables', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    of(a, b).pipe(mergeAll()).subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, null, done);
  });

  it('should merge two immediately-scheduled observables', (done) => {
    const a = of<number>(1, 2, 3, queueScheduler);
    const b = of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 4, 3, 5, 6, 7, 8];

    of(a, b, queueScheduler).pipe(mergeAll()).subscribe((val) => {
      expect(val).to.equal(r.shift());
    }, null, done);
  });
});
