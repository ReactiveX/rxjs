import { expect } from 'chai';
import { sum, mergeMap, skip, take } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, range } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {sum} */
describe('sum operator', () => {
  asDiagram('sum')('should find the sum of values of an observable', () => {
    const e1 = hot('--a--b--c--|', { a: 42, b: -1, c: 3 });
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    expectObservable((<any>e1).pipe(sum())).toBe(expected, { x: 44 });
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should be never when source is never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).pipe(sum())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(w|)';

    expectObservable((<any>e1).pipe(sum())).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', () => {
    const e1 = hot('--x--^--y--');
    const e1subs =      '^     ';
    const expected =    '------';

    expectObservable((<any>e1).pipe(sum())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sum the unique value of an observable', () => {
    const e1 = hot('-x-^--y--|', { y: 42 });
    const e1subs =    '^     !';
    const expected =  '------(w|)';

    expectObservable((<any>e1).pipe(sum())).toBe(expected, { w: 42 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sum the values of an ongoing hot observable', () => {
    const e1 = hot('--a-^-b--c--d--|', { a: 42, b: -1, c: 0, d: 666 });
    const subs =           '^          !';
    const expected =       '-----------(x|)';

    expectObservable((<any>e1).pipe(sum())).toBe(expected, { x: 665 });
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 = hot('--a--b--c--|', { a: 42, b: -1, c: 0 });
    const unsub =      '      !     ';
    const subs =       '^     !     ';
    const expected =   '-------     ';

    expectObservable((<any>e1).pipe(sum()), unsub).toBe(expected, { x: 41.5 });
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--|', { a: 42, b: -1, c: 1 });
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = (<any>source).pipe(
      mergeMap((x: string) => of(x)),
      sum(),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, { x: 14 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should sum a range() source observable', (done: MochaDone) => {
    (<any>range(1, 10000)).pipe(sum()).subscribe(
      (value: number) => {
        expect(value).to.equal(50005000);
      }, (x: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should sum a range().skip(1) source observable', (done: MochaDone) => {
    (<any>range(1, 10)).pipe(
      skip(1),
      sum()
    ).subscribe(
      (value: number) => {
        expect(value).to.equal(54);
      }, (x: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should sum a range().take(2) source observable', (done: MochaDone) => {
    (<any>range(1, 10)).pipe(
      take(2),
      sum()
    ).subscribe(
      (value: number) => {
        expect(value).to.equal(3);
      }, (x: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should work with error', () => {
    const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    const e1subs =    '^        !';
    const expected =  '---------#';

    expectObservable((<any>e1).pipe(sum())).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).pipe(sum())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a constant predicate on an empty hot observable', () => {
    const e1 = hot('-x-^---|');
    const e1subs =    '^   !';
    const expected =  '----(w|)';

    const predicate = function <T>(x: T) {
      return 42;
    };

    expectObservable((<any>e1).pipe(sum(predicate))).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a constant predicate on an never hot observable', () => {
    const e1 = hot('-x-^----');
    const e1subs =    '^    ';
    const expected =  '-----';

    const predicate = function <T>(x: T) {
      return 42;
    };

    expectObservable((<any>e1).pipe(sum(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a constant predicate on a simple hot observable', () => {
    const e1 = hot('-x-^-a-|', { a: 1 });
    const e1subs =    '^   !';
    const expected =  '----(w|)';

    const predicate = function () {
      return 42;
    };

    expectObservable((<any>e1).pipe(sum(predicate))).toBe(expected, { w: 42 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a predicate for string on observable with many values', () => {
    const e1 = hot('-a-^-b--c--d-|');
    const e1subs =    '^         !';
    const expected =  '----------(w|)';

    const predicate = function (x: number) {
      return x;
    };

    expectObservable((<any>e1).pipe(sum(predicate))).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a constant predicate on observable that throws', () => {
    const e1 = hot('-1-^---#');
    const e1subs =    '^   !';
    const expected =  '----#';

    const predicate = () => {
      return 42;
    };

    expectObservable((<any>e1).pipe(sum(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a predicate that throws, on observable with many values', () => {
    const e1 = hot('-1-^-2--3--|');
    const e1subs =    '^    !   ';
    const expected =  '-----#   ';

    const predicate = function (x: string) {
      if (x === '3') {
        throw 'error';
      }
      return parseFloat(x);
    };

    expectObservable((<any>e1).pipe(sum(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
