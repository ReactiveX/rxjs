import { dematerialize } from 'rxjs/operators';
import { of, NotificationLike } from 'rxjs';
import { expect } from 'chai';

describe('dematerialize', () => {
  it('should make a stream from notifications', () => {
    const results: any[] = [];

    of<NotificationLike<number>>(
      { kind: 'N', value: 1 },
      { kind: 'N', value: 2 },
      { kind: 'N', value: 3 },
      { kind: 'C' },
    )
    .pipe(
      dematerialize(),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should handle error notifications', () => {
    const results: any[] = [];

    of<NotificationLike<number>>(
      { kind: 'N', value: 1 },
      { kind: 'N', value: 2 },
      { kind: 'N', value: 3 },
      { kind: 'E', error: 'bad' },
    )
    .pipe(
      dematerialize(),
    )
    .subscribe({
      next(value) { results.push(value); },
      error(err) { results.push(err); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'bad']);
  });
});
