const filterFromInImports = require('./filterFromInImports')();

const words = ['import', ' { ', 'from', ' } ', 'from', ' \'', 'rxjs', '\';'];
const words2 = [' } ', 'from', '(', 'of'];

describe('filterFromInImports(words, index)', () => {
  it('should not filter the word, if the word is not "from"', () => {
    expect(filterFromInImports(words, 0)).toEqual(false);
  });

  it('should not filter the word, if the word "from" is not positioned between } and \' signs', () => {
    expect(filterFromInImports(words, 2)).toEqual(false);
  });

  it('should filter "from" when "from" is positioned between } and \' signs', () => {
    expect(filterFromInImports(words, 4)).toEqual(true);
  });

  it('should not filter "from" when "from" is after } but not before \'', () => {
    expect(filterFromInImports(words2, 1)).toEqual(false);
  });
});
