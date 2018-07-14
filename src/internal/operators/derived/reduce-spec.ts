import { reduce } from './reduce';
import { expect } from 'chai';
import { of } from '../../create/of';

describe('reduce', () => {
  it('should reduce and emit', () => {
    const results: any[] = [];

    of(1, 2, 3).pipe(
      reduce((acc, n) => acc + n, 0)
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([6, 'done']);
  });

  it('should provide the proper arguments to the reducer', () => {
    const results: any[] = [];

    of('a', 'b', 'c').pipe(
      reduce((_, n, i) => [_, n, i], undefined)
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    const first = [undefined, 'a', 0];
    const second = [first, 'b', 1];
    const third = [second, 'c', 2];

    expect(results).to.deep.equal([
      third,
      'done',
    ]);
  });

  it('should skip one and use the first emitted value as the initial state if none is provided', () => {
    const results: any[] = [];

    of(1, 2, 3).pipe(
      reduce((acc, n) => acc + n)
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([6, 'done']);
  });
});
