import { of } from 'rxjs/internal/create/of';
import { repeat } from 'rxjs/internal/operators/repeat';
import { expect } from 'chai';
import { Observable } from '../Observable';

describe('repeat', () => {
  it('should repeat and complete', () => {
    const results: any[] = [];

    of(1, 2).pipe(
      repeat(3),
    )
    .subscribe({
      next(value) { results.push(value); },
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
      repeat(3),
    ).subscribe();

    return Promise.resolve().then(() => expect(teardowns).to.equal(3))
  });
});
