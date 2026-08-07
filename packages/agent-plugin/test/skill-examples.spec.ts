import { describe, expect, it } from 'vitest';
import { lastValueFrom, of } from 'rxjs7';
import { map as map7 } from 'rxjs7/operators';
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';

describe('version-specific skill examples', () => {
  it('runs an RxJS 7 pipeable authoring and testing example', async () => {
    await expect(lastValueFrom(of(1, 2, 3).pipe(map7((value) => value * 2)))).resolves.toBe(6);
  });

  it('runs an RxJS 9 Symbol authoring example with cancellation teardown', () => {
    const values: number[] = [];
    let teardowns = 0;
    const source = new ColdObservable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.addTeardown(() => {
        teardowns++;
      });
    });
    const controller = new AbortController();
    source[map]((value) => value * 10).subscribe((value) => values.push(value), { signal: controller.signal });
    controller.abort();
    expect(values).toEqual([10, 20]);
    expect(teardowns).toBe(1);
  });
});
