import {expect} from 'chai';
import {TimeoutError} from '../../dist/cjs/util/TimeoutError';

describe('TimeoutError', () => {
  let err: TimeoutError;

  before(() => {
    err = new TimeoutError();
  });

  it('should be an instance of Error', function () {
    expect(err instanceof Error).to.equal(true);
  });

  it('should be an instance of TimeoutError', function () {
    expect(err instanceof TimeoutError).to.equal(true);
  });

  it('should be expected name', function () {
    expect(err.name).to.equal('TimeoutError');
  });

  it('should be expected message', function () {
    expect(err.message).to.equal('Timeout has occurred');
  });

  // XXX: `Error.stack` is not supported in IE9.
  // So we give up to test it.
});