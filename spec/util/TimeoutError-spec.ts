import { expect } from 'chai';
import { TimeoutError } from 'rxjs/util/TimeoutError';

/** @test {TimeoutError} */
describe('TimeoutError', () => {
  const error = new TimeoutError();
  it('Should have a name', () => {
    expect(error.name).to.be.equal('TimeoutError');
  });
  it('Should have a message', () => {
    expect(error.message).to.be.equal('Timeout has occurred');
  });
});
