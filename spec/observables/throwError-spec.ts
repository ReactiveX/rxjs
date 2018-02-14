import { expect } from 'chai';
import * as Rx from '../../src/Rx';
import { throwError } from '../../src/internal/observable/throwError';
import { expectObservable } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: Rx.TestScheduler;

/** @test {throw} */
describe('throwError', () => {
  asDiagram('throw(e)')('should create a cold observable that just emits an error', () => {
    const expected = '#';
    const e1 = throwError('error');
    expectObservable(e1).toBe(expected);
  });

  it('should emit one value', (done: MochaDone) => {
    let calls = 0;
    throwError('bad').subscribe(() => {
      done(new Error('should not be called'));
    }, (err: any) => {
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
