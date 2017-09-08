import { expect } from 'chai';
import { root } from '../../dist/package/util/root';

/** @test {root} */
describe('root', () => {
  it('should exist', () => {
    expect(typeof root).to.equal('object');
  });
});
