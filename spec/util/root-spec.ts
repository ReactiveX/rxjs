import { expect } from 'chai';
import { root } from '../../src/util/root';

/** @test {root} */
describe('root', () => {
  it('should exist', () => {
    expect(typeof root).to.equal('object');
  });
});
