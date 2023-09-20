import { DocCollection, Document, Processor } from 'dgeni';

export function markAliases(log: any): MarkAliases {
  return new MarkAliases(log);
}

const getOriginalName = (doc: Document): string => doc.aliasSymbol.resolvedSymbol.escapedName;

class MarkAliases implements Processor {
  $runAfter = ['readTypeScriptModules'];
  $runBefore = ['generateApiListDoc', 'createSitemap'];

  constructor(
    private log: any,
  ) {
  }

  $process(docs: DocCollection): void {
    docs
      .filter((doc: Document) => doc.moduleDoc)
      .forEach((doc: Document) => {
        const duplicateDocs = this.findDuplicateDocs(doc);

        if (duplicateDocs.length > 0) {
          duplicateDocs.forEach((duplicateDoc: Document) => duplicateDoc.duplicateOf = doc);
          doc.renamedDuplicates = duplicateDocs;

          this.log.debug(`${doc.name} has the following aliases:`,
            duplicateDocs.map((doc: Document) => doc.name).join(', '));
        }
      });
  }

  private findDuplicateDocs(doc: Document): DocCollection {
    return doc.moduleDoc.exports
      .filter((exportedDoc: Document) => exportedDoc !== doc
        && exportedDoc.aliasSymbol
        && getOriginalName(exportedDoc) === doc.name
      );
  }
}
