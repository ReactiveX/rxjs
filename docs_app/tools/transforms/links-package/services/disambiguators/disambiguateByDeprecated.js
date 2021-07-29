module.exports = function disambiguateByDeprecated() {
  return (alias, originatingDoc, docs) => {
    const filteredDocs = docs.filter((doc) => doc.deprecated === undefined);
    return filteredDocs.length > 0 ? filteredDocs : docs;
  };
};
