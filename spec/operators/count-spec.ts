///<reference path='../../typings/jasmine/jasmine.d.ts'/>
import * as Rx from '../../dist/cjs/Rx';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

describe('count', () => {
  it('should be never when source is never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.count()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', () => {
    const e1 = hot('--x--^--y--');
    const e1subs =      '^     ';
    const expected =    '------';

    expectObservable(e1.count()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source doesn\'t have values', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should count the unique value of an observable', () => {
    const e1 = hot('-x-^--y--|');
    const e1subs =    '^     !';
    const expected =  '------(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 1 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should count the values of an observable', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    expectObservable(source.count()).toBe(expected, {x: 3});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should count the values of an ongoing hot observable', () => {
    const source = hot('--a-^-b--c--d--|');
    const subs =           '^          !';
    const expected =       '-----------(x|)';

    expectObservable(source.count()).toBe(expected, {x: 3});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should count a range() source observable', (done: any) => {
    Rx.Observable.range(1, 10).count().subscribe(
      function (value) {
        expect(value).toEqual(10);
      },
      done.fail,
      done
    );
  });

  it('should count a range().skip(1) source observable', (done: any) => {
    Rx.Observable.range(1, 10).skip(1).count().subscribe(
      function (value) {
        expect(value).toEqual(9);
      },
      done.fail,
      done
    );
  });

  it('should count a range().take(1) source observable', (done: any) => {
    Rx.Observable.range(1, 10).take(1).count().subscribe(
      function (value) {
        expect(value).toEqual(1);
      },
      done.fail,
      done
    );
  });

  it('should work with error', () => {
    const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable(e1.count()).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.count()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on an empty hot observable', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on an empty hot observable', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return false;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on a simple hot observable', () => {
    const e1 = hot('-x-^-a-|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 1 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on a simple hot observable', () => {
    const e1 = hot('-x-^-a-|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return false;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a match-all predicate on observable with many values', () => {
    const e1 = hot('-1-^-2--3--4-|');
    const e1subs =    '^         !';
    const expected =  '----------(w|)';
    const predicate = (value: string) => {
      return parseInt(value) < 10;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a match-none predicate on observable with many values', () => {
    const e1 = hot('-1-^-2--3--4-|');
    const e1subs =    '^         !';
    const expected =  '----------(w|)';
    const predicate = (value: string) => {
      return parseInt(value) > 10;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on observable that throws', () => {
    const e1 = hot('-1-^---#');
    const e1subs =    '^   !';
    const expected =  '----#';
    const predicate = () => {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on observable that throws', () => {
    const e1 = hot('-1-^---#');
    const e1subs =    '^   !';
    const expected =  '----#';
    const predicate = () => {
      return false;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on a hot never-observable', () => {
    const e1 = hot('-x-^----');
    const e1subs =    '^    ';
    const expected =  '-----';
    const predicate = () => {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a predicate that throws, on observable with many values', () => {
    const e1 = hot('-1-^-2--3--|');
    const e1subs =    '^    !   ';
    const expected =  '-----#   ';
    const predicate = (value: string) => {
      if (value === '3') {
        throw 'error';
      }
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
