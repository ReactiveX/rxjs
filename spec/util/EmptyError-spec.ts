import {expect} from 'chai';
import {EmptyError} from '../../dist/cjs/util/EmptyError';

describe('EmptyError', () => {
  let err: EmptyError;

  before(() => {
    err = new EmptyError();
  });

  it('should be an instance of Error', function () {
    expect(err instanceof Error).to.equal(true);
  });

  it('should be an instance of EmptyError', function () {
    expect(err instanceof EmptyError).to.equal(true);
  });

  it('should be expected name', function () {
    expect(err.name).to.equal('EmptyError');
  });

  it('should be expected message', function () {
    expect(err.message).to.equal('no elements in sequence');
  });

  // XXX: `Error.stack` is not supported in IE9.
  // So we give up to test it.
});