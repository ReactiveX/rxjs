import { expect } from 'chai';
import { asapScheduler as asap, range, of} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { concatMap, delay } from 'rxjs/operators';
import { assertDeepEquals } from 'rxjs/internal/test_helpers/assertDeepEquals';

/** @test {range} */
describe('range', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('range(1, 10)')
  it('should create an observable with numbers 1 to 10', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = range(1, 10)
        // for the purpose of making a nice diagram, spread out the synchronous emissions
        .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 2, testScheduler))));
      const expected = 'a-b-c-d-e-f-g-h-i-(j|)';
      const values = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
        f: 6,
        g: 7,
        h: 8,
        i: 9,
        j: 10,
      };
      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should work for two subscribers', () => {
    testScheduler.run(({ expectObservable }) => {
      const e1 = range(1, 5);
      const expected = '(abcde|)';
      const values = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5
      };
      expectObservable(e1).toBe(expected, values);
      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should synchronously create a range of values by default', () => {
    const results = [] as any[];
    range(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).to.deep.equal([12, 13, 14, 15]);
  });
});
