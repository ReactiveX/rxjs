import { tryUserFunction, resultIsError } from './userFunction';
import { expect } from 'chai';

describe('tryUserFunction and resultIsError', () => {
  it('should return ERROR_OBJECT for functions that error', () => {
    let passedArgs: any[];

    function erroringFunction(...args: any[]) {
      passedArgs = args;
      throw new Error('test');
    };

    const result = tryUserFunction(erroringFunction, 1, 2, 3);

    expect(resultIsError(result)).to.be.true;
    expect(passedArgs).to.deep.equal([1, 2, 3]);
  });

  it('should return the result and not ERROR_OBJECT for non-erroring functions', () => {
    let passedArgs: any[];

    function happyFunction(...args: any[]) {
      passedArgs = args;
      return 'happy result';
    };

    const result = tryUserFunction(happyFunction, 1, 2, 3);

    expect(resultIsError(result)).to.be.false;
    expect(result).to.equal('happy result');
    expect(passedArgs).to.deep.equal([1, 2, 3]);
  });
});
