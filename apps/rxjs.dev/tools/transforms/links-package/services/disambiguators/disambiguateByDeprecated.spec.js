const disambiguateByDeprecated = require('./disambiguateByDeprecated')();
const doc1 = { id: 'doc1' };
const doc2 = { id: 'doc2', deprecated: true };
const doc3 = { id: 'doc3', deprecated: '' };
const doc4 = { id: 'doc4' };
const doc5 = { id: 'doc5', deprecated: 'Some text' };

describe('disambiguateByDeprecated', () => {
  it('should filter out docs whose `deprecated` property is defined', () => {
    expect(disambiguateByDeprecated('alias', {}, [doc1, doc2, doc3, doc4, doc5])).toEqual([doc1, doc4]);
  });

  it('should not filter docs if all of them are `deprecated`', () => {
    expect(disambiguateByDeprecated('alias', {}, [doc2, doc3, doc5])).toEqual([doc2, doc3, doc5]);
  });
});
