import { describe, expect, it } from 'vitest';
import { lastValueFrom, Observable as Observable7, of, Subject as Subject7 } from 'rxjs7';
import type { OperatorFunction } from 'rxjs7';
import { concatMap as concatMap7, map as map7, toArray as toArray7 } from 'rxjs7/operators';
import { ColdObservable, Subject } from 'rxjs';
import { create } from 'rxjs/create';
import { map } from 'rxjs/map';

const mapDefined9: unique symbol = Symbol('mapDefined');

declare global {
  interface Observable<T> {
    [mapDefined9]<R>(project: (value: T, index: number) => R | undefined): Observable<R>;
  }
}

Observable.prototype[mapDefined9] = function <T, R>(
  this: Observable<T>,
  project: (value: T, index: number) => R | undefined
): Observable<R> {
  return this[create]<R>((subscriber) => {
    let index = 0;
    try {
      this.subscribe(
        {
          next: (value) => {
            if (!subscriber.active) return;
            try {
              const projected = project(value, index++);
              if (projected !== undefined) subscriber.next(projected);
            } catch (error) {
              subscriber.error(error);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    } catch (error) {
      subscriber.error(error);
    }
  });
};

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

  it('proves synchronous RxJS 7 Subject feedback and terminal order', () => {
    const input = new Subject7<number>();
    const events: string[] = [];

    input.pipe(map7((value) => value + 1)).subscribe({
      next(value) {
        events.push(`enter:${value}`);
        if (value < 2) input.next(value);
        else input.complete();
        events.push(`exit:${value}`);
      },
      complete: () => events.push('complete'),
    });

    input.next(0);

    expect(events).toEqual(['enter:1', 'enter:2', 'complete', 'exit:2', 'exit:1']);
  });

  it('proves synchronous RxJS 9 Subject feedback and terminal order', () => {
    const input = new Subject<number>();
    const owner = new AbortController();
    const events: string[] = [];

    input
      .asObservable()
      .map((value) => value + 1)
      .subscribe(
        {
          next(value) {
            events.push(`enter:${value}`);
            if (value < 2) input.next(value);
            else input.complete();
            events.push(`exit:${value}`);
          },
          complete: () => events.push('complete'),
        },
        { signal: owner.signal }
      );

    input.next(0);

    expect(events).toEqual(['enter:1', 'enter:2', 'complete', 'exit:2', 'exit:1']);
  });

  it('runs a subject-primed sequential RxJS 7 feedback machine', () => {
    const cycleInput = new Subject7<void>();
    const handled: number[][] = [];
    let cycle = 0;

    cycleInput
      .asObservable()
      .pipe(
        concatMap7(() => {
          cycle++;
          return of(cycle, cycle * 10).pipe(toArray7());
        })
      )
      .subscribe({
        next(results) {
          handled.push(results);
          if (cycle < 3) cycleInput.next();
          else cycleInput.complete();
        },
      });

    cycleInput.next();

    expect(handled).toEqual([
      [1, 10],
      [2, 20],
      [3, 30],
    ]);
  });

  it('runs a subject-primed sequential RxJS 9 feedback machine', async () => {
    const cycleInput = new Subject<void>();
    const owner = new AbortController();
    const handled: number[][] = [];
    let cycle = 0;

    const machine = cycleInput
      .asObservable()
      .map(() => ++cycle)
      .flatMap((value) => Observable.from([value, value * 10]).toArray());

    const completed = new Promise<void>((resolve, reject) => {
      machine.subscribe(
        {
          next(results) {
            handled.push(results);
            if (cycle < 3) cycleInput.next();
            else cycleInput.complete();
          },
          error: reject,
          complete: resolve,
        },
        { signal: owner.signal }
      );
    });

    cycleInput.next();
    await completed;

    expect(handled).toEqual([
      [1, 10],
      [2, 20],
      [3, 30],
    ]);
  });

  it('uses Subject errors as terminal feedback-machine inputs in both majors', () => {
    const failure = new Error('machine failed');
    const errors: unknown[] = [];
    const input7 = new Subject7<void>();
    const input9 = new Subject<void>();

    input7.asObservable().subscribe({ error: (error) => errors.push(error) });
    input9.asObservable().subscribe({ error: (error) => errors.push(error) });

    input7.error(failure);
    input9.error(failure);
    input7.next();
    input9.next();

    expect(errors).toEqual([failure, failure]);
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

  it('preserves ColdObservable lifecycle through an exact Symbol result', () => {
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

  it('runs the documented RxJS 9 exact-Symbol custom-operator pattern', () => {
    const events: string[] = [];
    const source = new ColdObservable<number>((subscriber) => {
      subscriber.addTeardown(() => events.push('source teardown'));
      subscriber.next(1);
    });
    const output = source[mapDefined9](() => {
      throw new Error('project failed');
    });

    expect(output).toBeInstanceOf(ColdObservable);
    output.subscribe({ error: () => events.push('error') });
    expect(events).toEqual(['source teardown', 'error']);

    const unrelated = Symbol('mapDefined');
    expect(unrelated).not.toBe(mapDefined9);
    expect((Observable.prototype as any)[unrelated]).toBeUndefined();
  });
});
