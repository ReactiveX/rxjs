import { interval, lastValueFrom, EMPTY, EmptyError, throwError, of, AbortError, NEVER } from 'rxjs';
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

  it('should support a default value', async () => {
    const source = EMPTY;
    const result = await lastValueFrom(source, { defaultValue: 0 });
    expect(result).to.equal(0);
  });

  it('should support an undefined config', async () => {
    const source = EMPTY;
    let error: any = null;
    try {
      await lastValueFrom(source, undefined as any);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(EmptyError);
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
    const source = throwError(() => new Error('blorp!'));
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

  
  if (typeof AbortController === 'function') {
    it('should support abort signal', async () => {
      const source = NEVER;
      const ac = new AbortController();
      const signal = ac.signal;
      setTimeout(() => {
        ac.abort();
      });
      let errorThrown: any;
      try {
        await lastValueFrom(source, { signal });
      } catch (err) {
        errorThrown = err;
      }
      expect(errorThrown).to.be.an.instanceOf(AbortError);
    });

    it('should support abort signal with a default value', async () => {
      const source = NEVER;
      const ac = new AbortController();
      const signal = ac.signal;
      setTimeout(() => {
        ac.abort();
      });
      let errorThrown: any;
      let result = 'not set';
      try {
        result = await lastValueFrom(source, { signal, defaultValue: 'bad' });
      } catch (err) {
        errorThrown = err;
      }
      expect(errorThrown).to.be.an.instanceOf(AbortError);
      expect(result).to.equal('not set');
    });
  }
});
