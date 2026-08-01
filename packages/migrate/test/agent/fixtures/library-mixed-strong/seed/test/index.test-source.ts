import { expect, test } from '@jest/globals';
import { firstValueFrom, of, toArray } from 'rxjs';
import { doubled, selectorFailure, windowed } from '../src/index.js';

test('PT-MIXED-ERROR preserves selector errors', async () => {
  await expect(firstValueFrom(selectorFailure())).rejects.toThrow('selector failed');
});

test('PT-MIXED-INPUT converts iterable input', async () => {
  await expect(firstValueFrom(doubled([1, 2]).pipe(toArray()))).resolves.toEqual([2, 4]);
});

test('PT-MIXED-PIPELINE retains unsupported work between supported segments', async () => {
  await expect(firstValueFrom(windowed(of(1)))).resolves.toBeDefined();
});
