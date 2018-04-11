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

  it('should convert an Array to an observable', () => {
    const results: any[] = [];
    const source = [1, 2, 3];
    from(source)
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should convert an ArrayLike to an observable', () => {
    const results: any[] = [];
    const source = {
      '0': 1,
      '1': 2,
      '2': 3,
      length: 3,
    };

    from(source)
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should convert an Iterable to an observable', () => {
    const results: any[] = [];
    const source = 'I am an iterable!';

    from(source)
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

    expect(results).to.deep.equal([...'I am an iterable!'.split(''), 'done']);
  });
});
