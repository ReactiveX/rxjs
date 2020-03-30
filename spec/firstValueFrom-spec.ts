import { interval, firstValueFrom, EMPTY, EmptyError, throwError, of } from 'rxjs';
import { expect } from 'chai';
import { finalize } from 'rxjs/operators';

describe('firstValueFrom', () => {
  it('should emit the first value as a promise', async () => {
    let finalized = false;
    const source = interval(10).pipe(finalize(() => (finalized = true)));
    const result = await firstValueFrom(source);
    expect(result).to.equal(0);
    expect(finalized).to.be.true;
  });

  it('should error for empty observables', async () => {
    const source = EMPTY;
    let error: any = null;
    try {
      await firstValueFrom(source);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(EmptyError);
  });

  it('should error for errored observables', async () => {
    const source = throwError(new Error('blorp!'));
    let error: any = null;
    try {
      await firstValueFrom(source);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.equal('blorp!');
  });

  it('should work with a synchronous observable', async () => {
    let finalized = false;
    const source = of('apples', 'bananas').pipe(finalize(() => (finalized = true)));
    const result = await firstValueFrom(source);
    expect(result).to.equal('apples');
    expect(finalized).to.be.true;
  });
});
