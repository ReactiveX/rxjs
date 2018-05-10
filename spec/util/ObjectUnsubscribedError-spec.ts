import { expect } from 'chai';
import { ObjectUnsubscribedError } from 'rxjs/util/ObjectUnsubscribedError';

/** @test {ObjectUnsubscribedError} */
describe('ObjectUnsubscribedError', () => {
  const error = new ObjectUnsubscribedError();
  it('Should have a name', () => {
    expect(error.name).to.be.equal('ObjectUnsubscribedError');
  });
  it('Should have a message', () => {
    expect(error.message).to.be.equal('object unsubscribed');
  });
});
