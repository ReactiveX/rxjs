import {expect} from 'chai';
import {ObjectUnsubscribedError} from '../../dist/cjs/util/ObjectUnsubscribedError';

describe('ObjectUnsubscribedError', () => {
  let err: ObjectUnsubscribedError;

  before(() => {
    err = new ObjectUnsubscribedError();
  });

  it('should be an instance of Error', function () {
    expect(err instanceof Error).to.equal(true);
  });

  it('should be an instance of ObjectUnsubscribedError', function () {
    expect(err instanceof ObjectUnsubscribedError).to.equal(true);
  });

  it('should be expected name', function () {
    expect(err.name).to.equal('ObjectUnsubscribedError');
  });

  it('should be expected message', function () {
    expect(err.message).to.equal('object unsubscribed');
  });

  // XXX: `Error.stack` is not supported in IE9.
  // So we give up to test it.
});