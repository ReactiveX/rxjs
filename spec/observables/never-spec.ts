import { NEVER } from 'rxjs';
import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';

/** @test {NEVER} */
describe('NEVER', () => {
  it('should create a cold observable that never emits', () => {
    const expected = '-';
    const e1 = NEVER;
    expectObservable(e1).toBe(expected);
  });

  it('should return the same instance every time', () => {
    expect(NEVER).to.equal(NEVER);
  });
});
