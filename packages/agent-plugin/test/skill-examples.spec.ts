import { describe, expect, it } from 'vitest';
import { lastValueFrom, Observable as Observable7, of } from 'rxjs7';
import type { OperatorFunction } from 'rxjs7';
import { map as map7 } from 'rxjs7/operators';
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';

function mapDefined<T, R>(project: (value: T, index: number) => R | undefined): OperatorFunction<T, R> {
  return (source) =>
    new Observable7<R>((subscriber) => {
      let index = 0;
      return source.subscribe({
        next(value) {
          if (subscriber.closed) return;
          try {
            const projected = project(value, index++);
            if (projected !== undefined) subscriber.next(projected);
          } catch (error) {
            subscriber.error(error);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      });
    });
}

describe('version-specific skill examples', () => {
  it('runs an RxJS 7 pipeable authoring and testing example', async () => {
    await expect(lastValueFrom(of(1, 2, 3).pipe(map7((value) => value * 2)))).resolves.toBe(6);
  });

  it('runs the documented RxJS 7 public custom-operator pattern', () => {
    expect(() => {
      of(1, 2, 3)
        .pipe(
          mapDefined((value) => {
            if (value === 3) throw new Error('project failed');
            return value === 1 ? undefined : value * 10;
          })
        )
        .subscribe({
          next: (value) => expect(value).toBe(20),
          error: (error) => expect(error).toEqual(new Error('project failed')),
        });
    }).not.toThrow();

    let tornDown = false;
    const source = new Observable7<number>((subscriber) => {
      subscriber.next(1);
      return () => {
        tornDown = true;
      };
    });
    const subscription = source.pipe(mapDefined((value) => value)).subscribe();
    subscription.unsubscribe();
    expect(tornDown).toBe(true);
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
