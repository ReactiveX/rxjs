import { Dgeni, Document, DocCollection } from 'dgeni';
import { Injector } from 'dgeni/lib/Injector';
import { ReadTypeScriptModules } from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import * as path from 'path';
import 'jasmine';

import * as testPackage from '../../helpers/test-package';
import { markAliases } from './markAliases';

describe('markAliases processor', () => {
  let dgeni: Dgeni;
  let injector: Injector;
  let readTypescript: ReadTypeScriptModules;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-api-package')]);
    injector = dgeni.configureInjector();
    readTypescript = injector.get('readTypeScriptModules');

    readTypescript.basePath = path.resolve(__dirname, '../mocks');
    readTypescript.sourceFiles = [
      'aliasedExports.ts'
    ];
  });

  it('should be available on the injector', () => {
    const processor = injector.get('markAliases');
    expect(processor.$process).toBeDefined();
  });

  it('should mark aliased exports and remove the aliased doc', () => {
    const exportedDocs: DocCollection = [];
    const moduleDoc = {
      docType: 'module', exports: exportedDocs,
    };
    exportedDocs.push(
      { docType: 'class', id: 'class-1', moduleDoc: moduleDoc, name: 'aliased-name',
        aliasSymbol: { escapedName: 'aliased-name', resolvedSymbol: { escapedName: 'original-name' } }
      },
      { docType: 'class', id: 'class-2', moduleDoc: moduleDoc, name: 'original-name',
        aliasSymbol: { escapedName: 'original-name', resolvedSymbol: { escapedName: 'original-name' } }
      },
      { docType: 'guide', id: 'guide-1', moduleDoc: moduleDoc, name: 'guide',
        aliasSymbol: { escapedName: 'guide', resolvedSymbol: { escapedName: 'guide' } }
      },
    );
    const docs = [
      moduleDoc,
      ...exportedDocs,
    ];

    const processor = markAliases(console);
    processor.$process(docs);

    const originalDoc = docs.find((doc: Document) => doc.name === 'original-name');
    const duplicateNames = originalDoc.renamedDuplicates.map((doc: Document) => doc.name);
    expect(duplicateNames).toEqual(['aliased-name']);
    expect(originalDoc).toBe(originalDoc.renamedDuplicates[0].duplicateOf);
  });

  it('should mark aliased exports and remove the aliased doc from a mock file', () => {
    const processor = markAliases(console);
    let docs: DocCollection = [];
    readTypescript.$process(docs);
    processor.$process(docs);

    const originalDoc = docs.find((doc: Document) => doc.name === 'operator');
    const duplicateNames = originalDoc.renamedDuplicates.map((doc: Document) => doc.name);
    expect(duplicateNames).toEqual(['aliasedOperator']);
    expect(originalDoc).toBe(originalDoc.renamedDuplicates[0].duplicateOf);
  });

  it('should leave non duplicate exports unmarked', () => {
    const processor = markAliases(console);
    let docs: DocCollection = [];
    readTypescript.$process(docs);
    processor.$process(docs);

    const nonDuplicateOperator = docs.find((doc: Document) => doc.name === 'operatorWithoutDuplicate');
    expect(nonDuplicateOperator.renamedDuplicates).toBeUndefined();
  });
});
