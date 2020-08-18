import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { pairwise, take } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { expect } from 'chai';

/** @test {pairwise} */
describe('pairwise operator', () => {
  it('should group consecutive emissions as arrays of two', () => {
    const e1 =   hot('--a--b-c----d--e---|');
    const expected = '-----u-v----w--x---|';

    const values = {
      u: ['a', 'b'],
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e']
    };

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected, values);
  });

  it('should pairwise things', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^                    !';
    const expected =    '------v--w--x--y--z--|';

    const values = {
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e'],
      y: ['e', 'f'],
      z: ['f', 'g']
    };

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not emit on single-element streams', () => {
    const e1 = hot('-----^--b----|');
    const e1subs =      '^       !';
    const expected =    '--------|';

    const values = {
    };

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle mid-stream throw', () => {
    const e1 = hot('--a--^--b--c--d--e--#');
    const e1subs =      '^              !';
    const expected =    '------v--w--x--#';

    const values = {
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e']
    };

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const source = (<any>e1).pipe(pairwise());

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be recursively re-enterable', () => {
    const results = new Array<[string, string]>();

    const subject = new Subject<string>();

    subject
      .pipe(
        pairwise(),
        take(3)
      )
      .subscribe(pair => {
        results.push(pair);
        subject.next('c');
      });

    subject.next('a');
    subject.next('b');

    expect(results).to.deep.equal([['a', 'b'], ['b', 'c'], ['c', 'c']]);
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      pairwise(),
      take(2),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
