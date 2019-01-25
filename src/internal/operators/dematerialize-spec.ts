import { dematerialize } from 'rxjs/operators';
import { of, NotificationLike } from 'rxjs';
import { expect } from 'chai';
import { NotificationKind } from 'rxjs/internal/types';

describe('dematerialize', () => {
  it('should make a stream from notifications', () => {
    const results: any[] = [];

    of<NotificationLike<number>>(
      { kind: NotificationKind.NEXT, value: 1 },
      { kind: NotificationKind.NEXT, value: 2 },
      { kind: NotificationKind.NEXT, value: 3 },
      { kind: NotificationKind.COMPLETE },
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
      { kind: NotificationKind.NEXT, value: 1 },
      { kind: NotificationKind.NEXT, value: 2 },
      { kind: NotificationKind.NEXT, value: 3 },
      { kind: NotificationKind.ERROR, error: 'bad' },
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
