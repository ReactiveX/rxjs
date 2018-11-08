import { Observable, of } from 'rxjs';
import { repeatWhen, takeWhile } from 'rxjs/operators';
import { expect } from 'chai';

describe('repeatWhen', () => {
  it('should repeatWhen and complete', () => {
    const results: any[] = [];

    of(1, 2).pipe(
      repeatWhen(completions => completions.pipe(
        takeWhile((_, i) => i < 2)
      )),
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { results.push(err); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 1, 2, 1, 2, 'done']);
  });

  it('should teardown the source between repetitions', () => {
    let teardowns = 0;
    const source = new Observable(subscriber => {
      subscriber.complete();
      return () => {
        teardowns++;
      };
    });

    source.pipe(
      repeatWhen(completions => completions.pipe(
        takeWhile((_, i) => i < 2)
      )),
    ).subscribe();

    return Promise.resolve().then(() => expect(teardowns).to.equal(3));
  });
});
