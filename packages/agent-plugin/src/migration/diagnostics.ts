import ts from 'typescript';
import type {
  CompatibilityClassification,
  DiagnosticDisposition,
  DiagnosticNextAction,
  DiagnosticSeverity,
  MigrationDiagnostic,
  MigrationDiagnosticCode,
  RefusalScope,
  SourcePosition,
  SourceSpan,
} from './types.js';

export interface DiagnosticInput {
  readonly code: MigrationDiagnosticCode;
  readonly message: string;
  readonly severity: DiagnosticSeverity;
  readonly disposition: DiagnosticDisposition;
  readonly refusalScope: RefusalScope;
  readonly classification: CompatibilityClassification;
  readonly nextAction: DiagnosticNextAction;
  readonly capabilityId?: string;
}

export function diagnosticForNode(sourceFile: ts.SourceFile, node: ts.Node, input: DiagnosticInput): MigrationDiagnostic {
  return diagnosticForOffsets(sourceFile, node.getStart(sourceFile), node.getEnd(), input);
}

export function diagnosticForOffsets(
  sourceFile: ts.SourceFile,
  startOffset: number,
  endOffset: number,
  input: DiagnosticInput
): MigrationDiagnostic {
  const span = sourceSpan(sourceFile, startOffset, endOffset);
  const capability = input.capabilityId ? `:${input.capabilityId}` : '';
  return {
    id: `${input.code}:${span.file}:${span.start.offset}-${span.end.offset}${capability}`,
    ...input,
    span,
  };
}

export function sourceSpan(sourceFile: ts.SourceFile, startOffset = 0, endOffset = sourceFile.getFullText().length): SourceSpan {
  return {
    file: sourceFile.fileName,
    start: sourcePosition(sourceFile, startOffset),
    end: sourcePosition(sourceFile, endOffset),
  };
}

export function sortDiagnostics(diagnostics: readonly MigrationDiagnostic[]): readonly MigrationDiagnostic[] {
  return [...diagnostics].sort(
    (left, right) =>
      left.span.file.localeCompare(right.span.file) ||
      left.span.start.offset - right.span.start.offset ||
      left.code.localeCompare(right.code) ||
      left.id.localeCompare(right.id)
  );
}

export function parseDiagnostics(sourceFile: ts.SourceFile): readonly MigrationDiagnostic[] {
  const diagnostics = (sourceFile as ts.SourceFile & { readonly parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics ?? [];
  return diagnostics.map((diagnostic) => {
    const start = diagnostic.start ?? 0;
    const end = start + (diagnostic.length ?? 0);
    return diagnosticForOffsets(sourceFile, start, end, {
      code: 'malformed-source',
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      severity: 'error',
      disposition: 'refused',
      refusalScope: 'file',
      classification: 'harness-rewrite',
      nextAction: { code: 'fix-input', message: 'Fix the TypeScript parse error before running the migration again.' },
    });
  });
}

function sourcePosition(sourceFile: ts.SourceFile, offset: number): SourcePosition {
  const boundedOffset = Math.max(0, Math.min(offset, sourceFile.getFullText().length));
  const position = sourceFile.getLineAndCharacterOfPosition(boundedOffset);
  return { offset: boundedOffset, line: position.line + 1, column: position.character + 1 };
}
