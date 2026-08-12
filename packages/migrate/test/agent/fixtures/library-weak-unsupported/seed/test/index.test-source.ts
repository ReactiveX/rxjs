import { describe, expect, it } from 'vitest';
import * as library from '../src/index.js';

describe('public exports only', () => {
  it('PT-WEAK-EXPORTS exposes the expected names without characterizing behavior', () => {
    expect(Object.keys(library).sort()).toEqual(['cached', 'legacyScheduled', 'ticks']);
  });
});
