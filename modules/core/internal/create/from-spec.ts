import { from } from './from';
import { expect } from 'chai';
import { take } from '../operators/take';

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

  describe('from(Array)', () => {
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

    it('should work with take', () => {
      const results: any[] = [];
      const source = [1, 2, 3, 4, 5];
      from(source).pipe(
        take(3),
      )
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });

  describe('from(ArrayLike)', () => {
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

    it('should work with take', () => {
      const results: any[] = [];
      const source = {
        '0': 1,
        '1': 2,
        '2': 3,
        '3': 4,
        '4': 5,
        length: 5,
      };

      from(source).pipe(
        take(3),
      )
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });

  describe('from(Iterable)', () => {
    it('should convert an Iterable to an observable', () => {
      const results: any[] = [];
      const source = 'Weee!';

      from(source)
        .subscribe({
          next(value) { results.push(value); },
          complete() {
            results.push('done');
          },
        });

      expect(results).to.deep.equal(['W', 'e', 'e', 'e', '!', 'done']);
    });


    it('should work with take', () => {
      const results: any[] = [];
      const source = 'Weeeeeeeeeeeeeee!';

      from(source).pipe(
        take(3),
      )
      .subscribe({
        next(value) { results.push(value); },
        complete() {
          results.push('done');
        },
      });

      expect(results).to.deep.equal(['W', 'e', 'e', 'done']);
    });
  });
});
