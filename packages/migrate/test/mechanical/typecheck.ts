import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));

export interface TypecheckEvidence {
  readonly fileName: string;
  readonly source: string;
  readonly paths: Record<string, string[]>;
}

export function typecheckEvidence(evidence: TypecheckEvidence): readonly ts.Diagnostic[] {
  // The migration package and RxJS Next are ESM packages. Use an explicit ESM
  // consumer file so this gate exercises their NodeNext declaration surface
  // without inheriting the repository root's lack of a package `type` field.
  const virtualFileName = `${repositoryRoot}.cache/migrate-mechanical/${evidence.fileName.replace(/\.ts$/, '.mts')}`;
  const options: ts.CompilerOptions = {
    baseUrl: repositoryRoot,
    lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    noUncheckedIndexedAccess: true,
    paths: evidence.paths,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  };
  const host = ts.createCompilerHost(options);
  const readSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) =>
    fileName === virtualFileName
      ? ts.createSourceFile(fileName, evidence.source, languageVersion, true, ts.ScriptKind.TS)
      : readSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  host.fileExists = ((fileExists) => (fileName) => fileName === virtualFileName || fileExists(fileName))(host.fileExists.bind(host));
  host.readFile = ((readFile) => (fileName) => (fileName === virtualFileName ? evidence.source : readFile(fileName)))(
    host.readFile.bind(host)
  );

  const program = ts.createProgram([virtualFileName], options, host);
  return ts.getPreEmitDiagnostics(program);
}

export function formatTypecheckDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => repositoryRoot,
    getNewLine: () => '\n',
  });
}
