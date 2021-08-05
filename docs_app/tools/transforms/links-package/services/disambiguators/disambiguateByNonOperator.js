/**
 * This link disambiguator will remove all the members from the list of ambiguous links
 * if there is at least one link to a doc that does not belong to 'operators' module.
 * TODO Remove this disambiguator once 'rxjs/operators' export is removed
 */
module.exports = function disambiguateByNonOperator() {
  return (alias, originatingDoc, docs) => {
    const filteredDocs = docs.filter((doc) => doc.moduleDoc.id !== 'operators');
    return filteredDocs.length > 0 ? filteredDocs : docs;
  };
};
