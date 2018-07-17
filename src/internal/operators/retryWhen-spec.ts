import { Observable, of, throwError } from 'rxjs';
import { retryWhen } from 'rxjs/operators';
import { expect } from 'chai';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';

describe('retryWhen', () => {
  it('should retryWhen and complete', () => {
    const results: any[] = [];

    new Observable(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error('womp womp');
    }).pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((err, i) => i < 2 ? of('go') : throwError(err)),
      )),
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { results.push(err); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 1, 2, 1, 2, 'womp womp']);
  });

  it('should teardown the source between repetitions', () => {
    let teardowns = 0;
    const source = new Observable(subscriber => {
      subscriber.error('bwuhahaha');
      return () => {
        teardowns++;
      };
    });

    source.pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((err, i) => i < 2 ? of('go') : throwError(err))
      )),
    ).subscribe();

    return Promise.resolve().then(() => expect(teardowns).to.equal(3))
  });
});
