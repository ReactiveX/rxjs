import { expect } from 'chai';
import * as sinon from 'sinon';
import { asapScheduler as asap, range, of} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { expectObservable } from '../helpers/marble-testing';
import { concatMap, delay } from 'rxjs/operators';

declare const rxTestScheduler: TestScheduler;

/** @test {range} */
describe('range', () => {
  it('should create an observable with numbers 1 to 10', () => {
    const e1 = range(1, 10)
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 20, rxTestScheduler))));
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

  it('should work for two subscribers', () => {
    const e1 = range(1, 5)
      .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 20, rxTestScheduler))));
    const expected = 'a-b-c-d-(e|)';
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

  it('should synchronously create a range of values by default', () => {
    const results = [] as any[];
    range(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).to.deep.equal([12, 13, 14, 15]);
  });

  it('should accept a scheduler', (done) => {
    const expected = [12, 13, 14, 15];
    sinon.spy(asap, 'schedule');

    const source = range(12, 4, asap);

    source.subscribe(function (x) {
      expect(asap.schedule).have.been.called;
      const exp = expected.shift();
      expect(x).to.equal(exp);
    }, function (x) {
      done(new Error('should not be called'));
    }, () => {
      (<any>asap.schedule).restore();
      done();
    });

  });

  it('should accept only one argument where count is argument and start is zero', () => {
    const e1 = range(5)
      .pipe(concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 20, rxTestScheduler))));
    const expected = 'a-b-c-d-(e|)';
    const values = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      e: 4
    };
    expectObservable(e1).toBe(expected, values);
    expectObservable(e1).toBe(expected, values);
  });

  it('should return empty for range(0)', () => {
    const results: any[] = [];
    range(0).subscribe({
      next: value => results.push(value),
      complete: () => results.push('done')
    })
    expect(results).to.deep.equal(['done'])
  });

  it('should return empty for range with a negative count', () => {
    const results: any[] = [];
    range(5, -5).subscribe({
      next: value => results.push(value),
      complete: () => results.push('done')
    })
    expect(results).to.deep.equal(['done'])
  });
});