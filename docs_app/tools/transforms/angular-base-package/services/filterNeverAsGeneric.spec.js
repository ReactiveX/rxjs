const filterNeverAsGeneric = require('./filterNeverAsGeneric')();

const words = ['const', ' ', 'never', ': ', 'Observable', '<', 'never', '>;'];

describe('filterNeverAsGeneric(words, index)', () => {
  it('should not filter the word, if the word is not "never"', () => {
    expect(filterNeverAsGeneric(words, 0)).toEqual(false);
  });

  it('should not filter the word, if the word "never" is not positioned between < and > signs', () => {
    expect(filterNeverAsGeneric(words, 2)).toEqual(false);
  });

  it('should filter "never" when "never" is positioned between < and > signs', () => {
    expect(filterNeverAsGeneric(words, 6)).toEqual(true);
  });
});
