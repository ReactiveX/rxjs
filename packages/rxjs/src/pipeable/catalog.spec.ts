import { describe, expect, expectTypeOf, it } from 'vitest';
import * as functionalSurface from '../index.js';
import { merge as mergeSymbol } from '../merge.js';
import * as symbolSurface from '../symbol/index.js';
import catalog from './catalog.json' with { type: 'json' };

describe('complete functional surface', () => {
  it('exports every source-bound capability as a root function', () => {
    const exports = functionalSurface as unknown as Record<string, unknown>;

    for (const name of catalog.pipeableOperators) {
      expect(exports[name], `missing pipeable root export ${name}`).toBeTypeOf('function');
    }
  });

  it('exports every static capability as a root function', () => {
    const exports = functionalSurface as unknown as Record<string, unknown>;

    for (const name of catalog.staticFunctions) {
      expect(exports[name], `missing static root export ${name}`).toBeTypeOf('function');
    }
  });

  it('retains every exact Symbol through the symbol barrel', () => {
    const exports = symbolSurface as unknown as Record<string, unknown>;

    for (const name of catalog.symbols) {
      expect(exports[name], `missing exact Symbol export ${name}`).toBeTypeOf('symbol');
    }
  });

  it('runs generated operators through the existing exact-Symbol implementations', () => {
    const buffered: number[][] = [];
    const merged: Array<number | string> = [];
    const symbolMerged: Array<number | string> = [];

    functionalSurface.rx([1, 2, 3], functionalSurface.buffer({ maxSize: 2 })).subscribe((value) => buffered.push(value));
    functionalSurface.rx([1, 2], functionalSurface.mergeWith([['three']])).subscribe((value) => merged.push(value));
    Observable.from([1, 2])[mergeSymbol]([['three']]).subscribe((value) => symbolMerged.push(value));

    expect(buffered).toEqual([[1, 2], [3]]);
    expect(merged).toEqual([1, 2, 'three']);
    expect(symbolMerged).toEqual(merged);
  });

  it('keeps AsyncIterable terminals outside the Observable result type', async () => {
    const iterable = functionalSurface.rx(
      [1, 2, 3],
      functionalSurface.map((value) => value * 10),
      functionalSurface.iterateEachValue()
    );
    const values: number[] = [];

    for await (const value of iterable) {
      values.push(value);
    }

    expectTypeOf(iterable).toEqualTypeOf<AsyncGenerator<number, void, void>>();
    expect(values).toEqual([10, 20, 30]);
  });

  it('keeps static creation separate from source-bound *With operators', () => {
    const staticValues: Array<number | string> = [];
    const sourceBoundValues: Array<number | string> = [];

    functionalSurface.merge([[1, 2], ['three']]).subscribe((value) => staticValues.push(value));
    functionalSurface.rx([1, 2], functionalSurface.mergeWith([['three']])).subscribe((value) => sourceBoundValues.push(value));

    expect(staticValues).toEqual([1, 2, 'three']);
    expect(sourceBoundValues).toEqual(staticValues);
  });
});
