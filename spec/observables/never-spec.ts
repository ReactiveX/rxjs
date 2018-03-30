import { NEVER } from 'rxjs';
import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';

declare const asDiagram: any;

/** @test {NEVER} */
describe('NEVER', () => {
  asDiagram('NEVER')('should create a cold observable that never emits', () => {
    const expected = '-';
    const e1 = NEVER;
    expectObservable(e1).toBe(expected);
  });

  it('should return the same instance every time', () => {
    expect(NEVER).to.equal(NEVER);
  });
});
