import {expect} from 'chai';
import {ArgumentOutOfRangeError} from '../../dist/cjs/util/ArgumentOutOfRangeError';

describe('ArgumentOutOfRangeError', () => {
  let err: ArgumentOutOfRangeError;

  before(() => {
    err = new ArgumentOutOfRangeError();
  });

  it('should be an instance of Error', function () {
    expect(err instanceof Error).to.equal(true);
  });

  it('should be an instance of ArgumentOutOfRangeError', function () {
    expect(err instanceof ArgumentOutOfRangeError).to.equal(true);
  });

  it('should be expected name', function () {
    expect(err.name).to.equal('ArgumentOutOfRangeError');
  });

  it('should be expected message', function () {
    expect(err.message).to.equal('argument out of range');
  });

  // XXX: `Error.stack` is not supported in IE9.
  // So we give up to test it.
});