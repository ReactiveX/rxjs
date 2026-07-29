import { beforeAll, describe, expect, it } from 'vitest';
import { portedExpect } from './capabilities.js';

describe('ported Chai assertions', () => {
  beforeAll(async () => {
    await import('@rxjs/observable-polyfill');
    const { ColdObservable } = await import('../../src/cold-observable.js');
    Object.defineProperty(globalThis, 'Observable', {
      configurable: true,
      value: ColdObservable,
      writable: true,
    });
  });

  it('formats a failed Observable assertion without invoking the inspect operator', async () => {
    const { Subject } = await import('../../src/subject.js');
    const source = new Observable<void>((subscriber) => subscriber.complete());
    const inspectOperator = source.inspect;
    const prototype = Object.getPrototypeOf(source);
    const sourceSymbols = Object.getOwnPropertySymbols(source);
    const prototypeSymbols = Object.getOwnPropertySymbols(prototype);
    Object.preventExtensions(source);
    const startedAt = performance.now();

    let error: unknown;
    try {
      portedExpect(source).to.be.an.instanceOf(Subject);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('expected [Observable] to be an instance of Subject');
    expect(performance.now() - startedAt).toBeLessThan(1_000);
    expect(source.inspect).toBe(inspectOperator);
    expect(Object.getOwnPropertySymbols(source)).toEqual(sourceSymbols);
    expect(Object.getOwnPropertySymbols(prototype)).toEqual(prototypeSymbols);

    let completed = false;
    source.inspect({ complete: () => (completed = true) }).subscribe();
    expect(completed).toBe(true);
  });
});
