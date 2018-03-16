import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { throwError } from 'rxjs';
import { expectObservable } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

/** @test {throw} */
describe('throwError', () => {
  asDiagram('throw(e)')('should create a cold observable that just emits an error', () => {
    const expected = '#';
    const e1 = throwError('error');
    expectObservable(e1).toBe(expected);
  });

  it('should emit one value', (done) => {
    let calls = 0;
    throwError('bad').subscribe(() => {
      done(new Error('should not be called'));
    }, (err) => {
      expect(++calls).to.equal(1);
      expect(err).to.equal('bad');
      done();
    });
  });

  it('should accept scheduler', () => {
    const e = throwError('error', rxTestScheduler);

    expectObservable(e).toBe('#');
  });
});
