import { of } from '../create/of';
import { materialize } from './materialize';
import { map } from './map';
import { expect } from 'chai';

describe('materialize', () => {
  it('should materialize a successfully completed synchronous observable', () => {
    const results: any[] = [];

    const source = of(1, 2, 3);

    source.pipe(
      materialize(),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      { kind: 'N', value: 1 },
      { kind: 'N', value: 2 },
      { kind: 'N', value: 3 },
      { kind: 'C' },
      'done',
    ]);
  });


  it('should materialize an synchronously errored observable', () => {
    const results: any[] = [];

    const source = of(1, 2, 3);

    source.pipe(
      map(n => {
        if (n === 3) {
          throw 'lol';
        }
        return n;
      }),
      materialize(),
    )
    .subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([
      { kind: 'N', value: 1 },
      { kind: 'N', value: 2 },
      { kind: 'E', error: 'lol' },
      'done',
    ]);
  });
});
