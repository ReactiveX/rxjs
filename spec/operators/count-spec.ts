import { expect } from 'chai';
import { of, range } from 'rxjs';
import { count, skip, take, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {count} */
describe('count operator', () => {
  asDiagram('count')('should count the values of an observable', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    expectObservable(source.pipe(count())).toBe(expected, {x: 3});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should be never when source is never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(count())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(w|)';

    expectObservable(e1.pipe(count())).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', () => {
    const e1 = hot('--x--^--y--');
    const e1subs =      '^     ';
    const expected =    '------';

    expectObservable(e1.pipe(count())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source doesn\'t have values', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';

    expectObservable(e1.pipe(count())).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should count the unique value of an observable', () => {
    const e1 = hot('-x-^--y--|');
    const e1subs =    '^     !';
    const expected =  '------(w|)';

    expectObservable(e1.pipe(count())).toBe(expected, { w: 1 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should count the values of an ongoing hot observable', () => {
    const source = hot('--a-^-b--c--d--|');
    const subs =           '^          !';
    const expected =       '-----------(x|)';

    expectObservable(source.pipe(count())).toBe(expected, {x: 3});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should count a range() source observable', (done: MochaDone) => {
    range(1, 10).pipe(count()).subscribe(
      (value: number) => {
        expect(value).to.equal(10);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should count a range().skip(1) source observable', (done: MochaDone) => {
    range(1, 10).pipe(
      skip(1),
      count()
    ).subscribe(
      (value: number) => {
        expect(value).to.equal(9);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should count a range().take(1) source observable', (done: MochaDone) => {
    range(1, 10).pipe(
      take(1),
      count()
    ).subscribe(
      (value: number) => {
        expect(value).to.equal(1);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should work with error', () => {
    const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable(e1.pipe(count())).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(count())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on an empty hot observable', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return true;
    };

    expectObservable(e1.pipe(count(predicate))).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on an empty hot observable', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return false;
    };

    expectObservable(e1.pipe(count(predicate))).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on a simple hot observable', () => {
    const e1 = hot('-x-^-a-|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return true;
    };

    expectObservable(e1.pipe(count(predicate))).toBe(expected, { w: 1 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on a simple hot observable', () => {
    const e1 = hot('-x-^-a-|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';
    const predicate = () => {
      return false;
    };

    expectObservable(e1.pipe(count(predicate))).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 = hot('-1-^-2--3--4-|');
    const e1subs =    '^     !    ';
    const expected =  '-------    ';
    const unsub =     '      !    ';

    const result = e1.pipe(count((value: string) => parseInt(value) < 10));

    expectObservable(result, unsub).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 = hot('-1-^-2--3--4-|');
    const e1subs =    '^     !    ';
    const expected =  '-------    ';
    const unsub =     '      !    ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      count((value: string) => parseInt(value) < 10),
      mergeMap((x: number) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a match-all predicate on observable with many values', () => {
    const e1 = hot('-1-^-2--3--4-|');
    const e1subs =    '^         !';
    const expected =  '----------(w|)';
    const predicate = (value: string) => parseInt(value) < 10;

    expectObservable(e1.pipe(count(predicate))).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a match-none predicate on observable with many values', () => {
    const e1 = hot('-1-^-2--3--4-|');
    const e1subs =    '^         !';
    const expected =  '----------(w|)';
    const predicate = (value: string) => parseInt(value) > 10;

    expectObservable(e1.pipe(count(predicate))).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on observable that throws', () => {
    const e1 = hot('-1-^---#');
    const e1subs =    '^   !';
    const expected =  '----#';
    const predicate = () => true;

    expectObservable(e1.pipe(count(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on observable that throws', () => {
    const e1 = hot('-1-^---#');
    const e1subs =    '^   !';
    const expected =  '----#';
    const predicate = () => false;

    expectObservable(e1.pipe(count(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on a hot never-observable', () => {
    const e1 = hot('-x-^----');
    const e1subs =    '^    ';
    const expected =  '-----';
    const predicate = () => true;

    expectObservable(e1.pipe(count(predicate))).toBe(expected);
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

    expectObservable(e1.pipe(count(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
