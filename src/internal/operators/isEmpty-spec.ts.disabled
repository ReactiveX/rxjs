import { of, EMPTY } from 'rxjs';
import { isEmpty } from 'rxjs/operators';
import { expect } from 'chai';

describe('isEmpty', () => {
  it('should return false for non-empty observables', () => {
    const source = of('lol').pipe(
      isEmpty()
    );

    const results: any[] = [];

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([false, 'done']);
  });

  it('should return true for empty observables', () => {
    const source = EMPTY.pipe(
      isEmpty()
    );

    const results: any[] = [];

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([true, 'done']);
  });
});
