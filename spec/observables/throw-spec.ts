import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import { ErrorObservable } from '../../dist/package/observable/ErrorObservable';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {throw} */
describe('Observable.throw', () => {
  asDiagram('throw(e)')('should create a cold observable that just emits an error', () => {
    const expected = '#';
    const e1 = Observable.throw('error');
    expectObservable(e1).toBe(expected);
  });

  it('should emit one value', (done: MochaDone) => {
    let calls = 0;
    Observable.throw('bad').subscribe(() => {
      done(new Error('should not be called'));
    }, (err: any) => {
      expect(++calls).to.equal(1);
      expect(err).to.equal('bad');
      done();
    });
  });

  it('should create expose a error property', () => {
    const e = Observable.throw('error');

    expect(e['error']).to.equal('error');
  });

  it('should create ErrorObservable via static create function', () => {
    const e = new ErrorObservable('error');
    const r = ErrorObservable.create('error');

    expect(e).to.deep.equal(r);
  });

  it('should accept scheduler', () => {
    const e = Observable.throw('error', rxTestScheduler);

    expectObservable(e).toBe('#');
  });
});
