import { describe, expect, it } from 'vitest';
import { normalizeSelectedCase } from './normalize.js';

describe('normalizeSelectedCase', () => {
  it('inlines one-element parameter loops and selected bindings', () => {
    const result = normalizeSelectedCase(
      `for (const mode of ['cold']) { await run(mode, selectedCase); }`,
      { bindings: { selectedCase: 7 } }
    );
    expect(result).toContain("const mode = 'cold'");
    expect(result).toContain('await run(mode, 7)');
    expect(result).not.toContain('for (');
  });
});
