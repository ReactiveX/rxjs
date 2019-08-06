import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { forkJoin } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {forkJoin} */
describe('Observable.prototype.forkJoin', () => {
  asDiagram('forkJoin')('should emit the last emitted value from each observable', () => {
    const e1 =   hot('-a--b-----c-d-e-|');
    const e2 =   cold('--1--2-3-4---|   ');
    const e3 =   hot('--------f--g-h-i--j-|');
    const expected = '--------------------(z|)';
    const expectedValue = {
      z: ['e', '4', 'j']
    };
    const result = forkJoin(e1, e2, e3);
    expectObservable(result).toBe(expected, expectedValue);
  });

  it('should work with two nevers', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const e2 = cold( '-');
    const e2subs =   '^';
    const expected = '-';

    const result = forkJoin(e1, e2);
    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and empty', () => {
    const e1 = cold( '-');
    const e2 = cold( '|');
    const expected = '|';

    const result = forkJoin(e1, e2);
    expectObservable(result).toBe(expected);
  });
});
