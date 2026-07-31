import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { diagnosticForOffsets, parseDiagnostics, sortDiagnostics } from './diagnostics.js';

describe('migration diagnostics', () => {
  it('reports stable one-based source spans', () => {
    const sourceFile = ts.createSourceFile('src/example.ts', 'const value = map(source);\n', ts.ScriptTarget.Latest, true);
    const start = sourceFile.text.indexOf('map');
    const diagnostic = diagnosticForOffsets(sourceFile, start, start + 3, {
      code: 'unsafe-binding',
      message: 'shadowed',
      severity: 'error',
      disposition: 'refused',
      refusalScope: 'transform',
      classification: 'harness-rewrite',
      nextAction: { code: 'review-source', message: 'Rename the binding.' },
    });

    expect(diagnostic.id).toBe('unsafe-binding:src/example.ts:14-17');
    expect(diagnostic.span).toEqual({
      file: 'src/example.ts',
      start: { offset: 14, line: 1, column: 15 },
      end: { offset: 17, line: 1, column: 18 },
    });
  });

  it('turns parse errors into deterministic file refusals', () => {
    const sourceFile = ts.createSourceFile('broken.ts', 'const value = ;', ts.ScriptTarget.Latest, true);
    const diagnostics = parseDiagnostics(sourceFile);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: 'malformed-source',
      severity: 'error',
      disposition: 'refused',
      refusalScope: 'file',
      span: { file: 'broken.ts' },
    });
  });

  it('orders diagnostics by file, offset, and code', () => {
    const sourceFile = ts.createSourceFile('b.ts', 'one two', ts.ScriptTarget.Latest, true);
    const input = {
      message: 'review',
      severity: 'warning',
      disposition: 'requires-review',
      refusalScope: 'none',
      classification: 'compatibility-only',
      nextAction: { code: 'review-source', message: 'Review it.' },
    } as const;
    const later = diagnosticForOffsets(sourceFile, 4, 7, { ...input, code: 'lifecycle-review' });
    const earlier = diagnosticForOffsets(sourceFile, 0, 3, { ...input, code: 'scheduler-argument' });
    expect(sortDiagnostics([later, earlier]).map(({ id }) => id)).toEqual([earlier.id, later.id]);
  });
});
