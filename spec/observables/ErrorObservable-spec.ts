import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {ErrorObservable} from '../../dist/cjs/observable/ErrorObservable';
declare const expectObservable: any;

declare const rxTestScheduler: Rx.TestScheduler;

/** @test {throw} */
describe('ErrorObservable', () => {
  it('should create expose a error property', () => {
    const e = new ErrorObservable('error');

    expect(e.error).to.equal('error');
  });

  it('should create ErrorObservable via static create function', () => {
    const e = new ErrorObservable('error');
    const r = ErrorObservable.create('error');

    expect(e).to.deep.equal(r);
  });

  it('should accept scheduler', () => {
    const e = ErrorObservable.create('error', rxTestScheduler);

    expectObservable(e).toBe('#');
  });
});
