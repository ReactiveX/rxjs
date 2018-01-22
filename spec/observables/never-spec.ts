import { never } from '../../src/create';
import { expect } from 'chai';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const asDiagram: any;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

/** @test {never} */
describe('never', () => {
  asDiagram('never')('should create a cold observable that never emits', () => {
    const expected = '-';
    const e1 = never();
    expectObservable(e1).toBe(expected);
  });

  it('should return the same instance every time', () => {
    expect(never()).to.equal(never());
  });
});
