import { interval, firstValueFrom, EMPTY, EmptyError, throwError, of, Observable } from 'rxjs';
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

  it('should support a default value', async () => {
    const source = EMPTY;
    const result = await firstValueFrom(source, { defaultValue: 0 });
    expect(result).to.equal(0);
  });

  it('should support an undefined config', async () => {
    const source = EMPTY;
    let error: any = null;
    try {
      await firstValueFrom(source, undefined as any);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an.instanceOf(EmptyError);
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
    const source = throwError(() => new Error('blorp!'));
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

  it('should stop listening to a synchronous observable when resolved', async () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    const result = await firstValueFrom(synchronousObservable);
    expect(sideEffects).to.deep.equal([0]);
  });
});
