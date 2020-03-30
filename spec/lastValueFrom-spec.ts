import { interval, lastValueFrom, EMPTY, EmptyError, throwError, of } from 'rxjs';
import { expect } from 'chai';
import { finalize, take } from 'rxjs/operators';

describe('lastValueFrom', () => {
  it('should emit the last value as a promise', async () => {
    let finalized = false;
    const source = interval(2).pipe(
      take(10),
      finalize(() => (finalized = true))
    );
    const result = await lastValueFrom(source);
    expect(result).to.equal(9);
    expect(finalized).to.be.true;
  });

  it('should error for empty observables', async () => {
    const source = EMPTY;
    let error: any = null;
    try {
      await lastValueFrom(source);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(EmptyError);
  });

  it('should error for errored observables', async () => {
    const source = throwError(new Error('blorp!'));
    let error: any = null;
    try {
      await lastValueFrom(source);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal('blorp!');
  });

  it('should work with a synchronous observable', async () => {
    let finalized = false;
    const source = of('apples', 'bananas').pipe(finalize(() => (finalized = true)));
    const result = await lastValueFrom(source);
    expect(result).to.equal('bananas');
    expect(finalized).to.be.true;
  });
});
