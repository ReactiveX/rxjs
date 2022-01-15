import { interval, allValuesFrom, EMPTY, throwError, of } from 'rxjs';
import { expect } from 'chai';
import { finalize, take } from 'rxjs/operators';

describe('allValuesFrom', () => {
  it('should emit all the values as a promise', async () => {
    let finalized = false;
    const source = interval(2).pipe(take(4), finalize(() => (finalized = true)));
    const result = await allValuesFrom(source);
    expect(result).to.deep.equal([0, 1, 2, 3]);
    expect(finalized).to.be.true;
  });

  it('should produce empty arrays for empty observables', async () => {
    const source = EMPTY;
    const result = await allValuesFrom(source);
    expect(result).to.be.empty;
  });

  it('should error for errored observables', async () => {
    const source = throwError(() => new Error('blorp!'));
    let error: any = null;
    try {
      await allValuesFrom(source);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal('blorp!');
  });

  it('should work with a synchronous observable', async () => {
    let finalized = false;
    const source = of('apples', 'bananas').pipe(finalize(() => (finalized = true)));
    const result = await allValuesFrom(source);
    expect(result).to.deep.equal(['apples', 'bananas']);
    expect(finalized).to.be.true;
  });
});