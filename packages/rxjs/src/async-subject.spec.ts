import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { create } from './create.js';

type AsyncSubjectConstructor = typeof import('./async-subject.js').AsyncSubject;

let AsyncSubject: AsyncSubjectConstructor;

beforeAll(async () => {
  ({ AsyncSubject } = await import('./async-subject.js'));
});

describe('AsyncSubject', () => {
  it('emits only the final value followed by completion', () => {
    const subject = new AsyncSubject<number>();
    const events: Array<number | 'complete'> = [];
    subject.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    subject.next(1);
    subject.next(2);
    expect(events).toEqual([]);
    subject.complete();

    expect(events).toEqual([2, 'complete']);
    expect(subject.active).toBe(false);
  });

  it('completes without a value when no value was received', () => {
    const subject = new AsyncSubject<number>();
    const events: string[] = [];
    subject.subscribe({ complete: () => events.push('complete') });
    subject.complete();
    expect(events).toEqual(['complete']);
  });

  it('replays the final value and completion to every late observer', () => {
    const subject = new AsyncSubject<number>();
    const first: Array<number | 'complete'> = [];
    const second: Array<number | 'complete'> = [];
    subject.next(1);
    subject.next(2);
    subject.complete();

    subject.subscribe({
      next: (value) => first.push(value),
      complete: () => first.push('complete'),
    });
    subject.next(3);
    subject.subscribe({
      next: (value) => second.push(value),
      complete: () => second.push('complete'),
    });

    expect(first).toEqual([2, 'complete']);
    expect(second).toEqual([2, 'complete']);
  });

  it('errors current and late observers without emitting the retained value', () => {
    const failure = new Error('failed');
    const subject = new AsyncSubject<number>();
    const current: unknown[] = [];
    const late: unknown[] = [];
    subject.subscribe({
      next: (value) => current.push(value),
      error: (error) => current.push(error),
    });
    subject.next(1);
    subject.error(failure);
    subject.complete();
    subject.subscribe({
      next: (value) => late.push(value),
      error: (error) => late.push(error),
    });

    expect(current).toEqual([failure]);
    expect(late).toEqual([failure]);
  });

  it('does not notify observers cancelled before completion', () => {
    const subject = new AsyncSubject<number>();
    const controller = new AbortController();
    const values: number[] = [];
    subject.subscribe((value) => values.push(value), { signal: controller.signal });
    subject.next(1);
    controller.abort();
    subject.next(2);
    subject.complete();
    expect(values).toEqual([]);
  });

  it('guards completion and next against reentrancy while allowing late reentrant subscriptions', () => {
    const subject = new AsyncSubject<number>();
    const events: string[] = [];
    subject.subscribe({
      next: (value) => {
        subject.subscribe({
          next: (innerValue) => events.push(`inner ${innerValue}`),
          complete: () => events.push('inner complete'),
        });
        subject.next(value + 1);
        subject.complete();
        events.push(`outer ${value}`);
      },
      complete: () => events.push('outer complete'),
    });
    subject.next(1);
    subject.complete();

    expect(events).toEqual(['inner 1', 'inner complete', 'outer 1', 'outer complete']);
  });

  it('creates operator results and read-only views on the Observable base', () => {
    const subject = new AsyncSubject<number>();
    const result = subject[create]<string>((subscriber) => {
      subscriber.next('value');
      subscriber.complete();
    });
    const view = subject.asObservable();
    const values: string[] = [];
    result.subscribe((value) => values.push(value));

    expectTypeOf(view).toEqualTypeOf<Observable<number>>();
    expect(values).toEqual(['value']);
    expect(result).not.toBeInstanceOf(AsyncSubject);
    expect(view).toBeInstanceOf(Observable);
    expect(view).not.toBeInstanceOf(AsyncSubject);
    expect('next' in view).toBe(false);
  });
});
