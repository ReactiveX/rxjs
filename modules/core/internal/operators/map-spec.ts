import { of } from '../create/of';
import { map } from './map';
import { expect } from 'chai';

describe('map', () => {
  it('should do a basic map', () => {
    const source = of(1, 2, 3).pipe(
      map(x => x + x)
    );

    const results: any[] = [];

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([2, 4, 6, 'done']);
  });

  it('should emit errors thrown in map', () => {
    const source = of(1, 2, 3, 4).pipe(
      map(x => {
        if (x === 3) throw new Error('smooshed');
        return x + x;
      })
    );

    const results: any[] = [];
    let error: Error;

    source.subscribe({
      next(value) { results.push(value); },
      error(err) { error = err; },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([2, 4]);
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('smooshed');
  });
});
