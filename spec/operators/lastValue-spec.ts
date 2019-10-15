import { of, EMPTY, EmptyError, throwError } from 'rxjs';
import { expect } from 'chai';

describe('Observable.prototype.lastValue', () => {
  it('should resolve with the last value', async () => {
    const value = await of(1, 2, 3).lastValue();
    expect(value).to.equal(3);
  });

  it('should reject for empty observables with EmptyError', async () => {
    let error: any;
    try {
      await EMPTY.lastValue();
    } catch (err) {
      error = err;
    }
    expect(error).to.be.instanceOf(EmptyError);
  });

  it('should reject on errored observables', async () => {
    let error: any;
    try {
      await throwError(new Error('so bad, so so bad')).lastValue();
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal('so bad, so so bad');
  });
});