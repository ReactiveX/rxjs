const disambiguateByNonOperator = require('./disambiguateByNonOperator')();
const indexModule = { id: 'index' };
const operatorsModule = { id: 'operators' };
const doc1 = { id: 'doc1', moduleDoc: indexModule };
const doc2 = { id: 'doc2', moduleDoc: operatorsModule };
const doc3 = { id: 'doc3', moduleDoc: operatorsModule };
const doc4 = { id: 'doc4', moduleDoc: indexModule };

describe('disambiguateByNonOperator', () => {
  it('should filter out docs that are not operators', () => {
    const docs = [doc1, doc2];
    expect(disambiguateByNonOperator('alias', {}, docs)).toEqual([doc1]);
  });

  it('should return all docs if there are no operators', () => {
    const docs = [doc1, doc4];
    expect(disambiguateByNonOperator('alias', {}, docs)).toEqual([doc1, doc4]);
  });

  it('should return all docs if there are only operators', () => {
    const docs = [doc2, doc3];
    expect(disambiguateByNonOperator('alias', {}, docs)).toEqual([doc2, doc3]);
  });
});
