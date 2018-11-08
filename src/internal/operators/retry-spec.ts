import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { expect } from 'chai';

describe('retry', () => {
  it('should retry and error', () => {
    const results: any[] = [];

    new Observable(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error('womp womp');
    }).pipe(
      retry(3),
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { results.push(err); },
      complete() { results.push('done'); }
    });

    expect(results).to.deep.equal([1, 2, 1, 2, 1, 2, 1, 2, 'womp womp']);
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
      retry(3),
    ).subscribe();

    return Promise.resolve().then(() => expect(teardowns).to.equal(4));
  });
});
