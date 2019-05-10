import { expect } from 'chai';
import { createRxError, RxErrorCode, isRxError } from 'rxjs/internal/util/errors';

describe('createRxError', () => {
  it('should create an error with the Error constructor by default', () => {
    const error = createRxError('message', RxErrorCode.Empty);
    expect(error.message).to.equal('RxJS: message');
    expect(error.__rxjsErrorCode).to.equal(RxErrorCode.Empty);
    expect(isRxError(error)).to.be.true;
  });
});
