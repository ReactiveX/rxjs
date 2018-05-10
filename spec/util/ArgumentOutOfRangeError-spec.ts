import { expect } from 'chai';
import { ArgumentOutOfRangeError } from 'rxjs/util/ArgumentOutOfRangeError';

/** @test {ArgumentOutOfRangeError} */
describe('ArgumentOutOfRangeError', () => {
  const error = new ArgumentOutOfRangeError();
  it('Should have a name', () => {
    expect(error.name).to.be.equal('ArgumentOutOfRangeError');
  });
  it('Should have a message', () => {
    expect(error.message).to.be.equal('argument out of range');
  });
});
