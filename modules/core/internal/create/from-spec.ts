import { from } from './from';
import { expect } from 'chai';

describe('from', () => {
  it('should convert a Promise to an observable', (done) => {
    const results: string[] = [];

    from(Promise.resolve('test'))
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
          expect(results).to.deep.equal(['test', 'done']);
          done();
        },
      });
  });
});
