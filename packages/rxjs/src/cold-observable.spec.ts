import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { behaviorSubject } from './behavior-subject.js';
import { ColdObservable } from './cold-observable.js';
import { create } from './create.js';
import { filter } from './filter.js';
import { map } from './map.js';
import { mergeMap } from './merge-map.js';
import { scan } from './scan.js';
import { switchMap as rxSwitchMap } from './switch-map.js';

describe('ColdObservable', () => {
  let originalReportError: typeof globalThis.reportError;
  let reported: unknown[];

  beforeEach(() => {
    originalReportError = globalThis.reportError;
    reported = [];
    globalThis.reportError = (error) => {
      reported.push(error);
    };
  });

  afterEach(() => {
    globalThis.reportError = originalReportError;
  });

  it('reports source errors when the observer has no error handler', () => {
    const expected = new Error('source failed');

    new ColdObservable<never>((subscriber) => subscriber.error(expected)).subscribe();

    expect(reported).toEqual([expected]);
  });

  it('reports errors thrown by an observer error handler', () => {
    const expected = new Error('handler failed');

    new ColdObservable<never>((subscriber) => subscriber.error(new Error('source failed'))).subscribe({
      error: () => {
        throw expected;
      },
    });

    expect(reported).toEqual([expected]);
  });

  it('is a platform Observable subclass', () => {
    const source = new ColdObservable<number>(() => {});

    expect(source).toBeInstanceOf(Observable);
    expectTypeOf(source).toMatchTypeOf<Observable<number>>();
  });

  it('uses one versioned global Symbol for the create protocol', () => {
    expect(create).toBe(Symbol.for('rxjs.kernel.create.v1'));
    expect(Object.getOwnPropertyDescriptor(Observable.prototype, create)).toMatchObject({
      configurable: true,
      enumerable: false,
      writable: true,
    });
  });

  it('returns fresh platform Observables from every native Observable-returning method', () => {
    const source = new ColdObservable<number>(() => {});
    const notifier = new Observable<never>(() => {});
    const results = [
      source.takeUntil(notifier),
      source.map((value) => value + 1),
      source.filter(Boolean),
      source.take(1),
      source.drop(1),
      source.flatMap((value) => [value]),
      source.switchMap((value) => [value]),
      source.inspect(() => {}),
      source.catch(() => [0]),
      source.finally(() => {}),
    ];

    expect(new Set(results).size).toBe(results.length);
    for (const result of results) {
      expect(result).toBeInstanceOf(Observable);
      expect(result).not.toBeInstanceOf(ColdObservable);
    }
    expectTypeOf(source.map((value) => value + 1)).toEqualTypeOf<Observable<number>>();
  });

  it('overrides every string-named method on the active platform Observable', () => {
    const nativeMethods = Object.getOwnPropertyNames(Observable.prototype).filter(
      (key) => key !== 'constructor' && key !== 'subscribe' && typeof (Observable.prototype as any)[key] === 'function'
    );

    for (const key of nativeMethods) {
      expect(Object.prototype.hasOwnProperty.call(ColdObservable.prototype, key), key).toBe(true);
    }
  });

  it('routes native Promise consumers through a fresh platform view', async () => {
    const values: number[] = [];
    const source = new ColdObservable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    await source.forEach((value) => values.push(value));

    expect(values).toEqual([1, 2]);
    await expect(source.first()).resolves.toBe(1);
    await expect(source.last()).resolves.toBe(2);
    await expect(source.find((value) => value === 2)).resolves.toBe(2);
    await expect(source.some((value) => value === 2)).resolves.toBe(true);
    await expect(source.every((value) => value > 0)).resolves.toBe(true);
    await expect(source.reduce((total: number, value) => total + value, 0)).resolves.toBe(3);
    await expect(source.toArray()).resolves.toEqual([1, 2]);
  });

  it('returns ColdObservables from RxJS Symbol operators', async () => {
    const source = new ColdObservable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    const mapped = source[map]((value) => value + 1);
    const filtered = source[filter]((value) => value > 1);
    const scanned = source[scan]((total, value) => total + value, 0);
    const concatMapped = source[mergeMap]((value) => [value], { concurrent: 1 });
    const switched = source[rxSwitchMap]((value) => [value]);

    expect(mapped).toBeInstanceOf(ColdObservable);
    expect(filtered).toBeInstanceOf(ColdObservable);
    expect(scanned).toBeInstanceOf(ColdObservable);
    expect(concatMapped).toBeInstanceOf(ColdObservable);
    expect(switched).toBeInstanceOf(ColdObservable);
    await expect(mapped.toArray()).resolves.toEqual([2, 3]);
    await expect(filtered.toArray()).resolves.toEqual([2]);
    await expect(scanned.toArray()).resolves.toEqual([1, 3]);

    const createFromAnotherCompatibleCopy: typeof create = Symbol.for('rxjs.kernel.create.v1') as unknown as typeof create;
    const created = source[createFromAnotherCompatibleCopy]<string>((subscriber) => subscriber.complete());
    expectTypeOf(created).toEqualTypeOf<ColdObservable<string>>();
  });

  it('preserves the create protocol for subjects derived from ColdObservable', () => {
    const subject = behaviorSubject(1);

    expect(subject[map]((value) => value + 1)).toBeInstanceOf(ColdObservable);
    expect(subject[scan]((total, value) => total + value, 0)).toBeInstanceOf(ColdObservable);
    expect(subject.map((value) => value + 1)).toBeInstanceOf(Observable);
    expect(subject.map((value) => value + 1)).not.toBeInstanceOf(ColdObservable);
  });
});
