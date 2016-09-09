import { expect } from 'chai';
import { root } from '../../dist/cjs/util/root';

/** @test {root} */
describe('root', () => {
  it('should exist', () => {
    expect(typeof root).to.equal('object');
  });
});
