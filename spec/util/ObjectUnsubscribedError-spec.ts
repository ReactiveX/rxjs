import { expect } from 'chai';
import { ObjectUnsubscribedError } from 'rxjs/util/ObjectUnsubscribedError';
import { createObjectUnsubscribedError } from 'rxjs/internal/util/ObjectUnsubscribedError';

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

describe('createObjectUnsubscribedError', () => {
  const error = createObjectUnsubscribedError();
  it('Should have a message', () => {
    expect(error.message).to.be.equal('object unsubscribed');
  });
});
