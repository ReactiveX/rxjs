import { describe, expect, it } from 'vitest';
import { ColdObservable } from '../cold-observable.js';
import { operate } from './operate.js';

describe('operate', () => {
  it('constructs through the source protocol', () => {
    const source = new ColdObservable<number>(() => {});
    const operator = operate<number, string>(() => {});

    expect(operator(source)).toBeInstanceOf(ColdObservable);
  });

  it('delivers synchronous setup errors through the result subscriber', () => {
    const failure = new Error('setup failed');
    const errors: unknown[] = [];
    const source = new Observable<number>(() => {});
    const operator = operate<number, never>(() => {
      throw failure;
    });

    operator(source).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
  });
});
