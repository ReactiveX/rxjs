import { never } from '../../src/';
import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';

declare const asDiagram: any;

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
