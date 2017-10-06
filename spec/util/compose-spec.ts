import { expect } from 'chai';
import { compose } from '../../dist/cjs/util/compose';

describe('compose', () => {
  it('should exist', () => {
    expect(compose).to.be.a('function');
  });

  it('should compose functions together', () => {
    const addOne = x => x + 1;
    const double = x => x + x;
    const square = x => x * x;

    const composed = compose(
      addOne,
      double,
      square
    );

    const result = composed(2);

    expect(result).to.equal(square(double(addOne(2))));
  });

  it('should handle type switching', () => {
    const toString = (x: number) => '' + x;
    const toInt = (x: string) => parseInt(x);
    const toObject = (x: number) => ({ value: x });

    const composed = compose(
      toString,
      toInt,
      toObject
    );

    const result = composed(2.0);

    expect(result).to.deep.equal({ value: 2 });
  });
});