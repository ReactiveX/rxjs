import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { create } from './create.js';
import { Subject } from './subject.js';

describe('Subject.asObservable', () => {
  it('creates operator results on the Observable base rather than as mutable Subjects', () => {
    const subject = new Subject<number>();
    const values: number[] = [];
    const result = subject[create]<number>((subscriber) => {
      subscriber.next(1);
      subscriber.complete();
    });

    result.subscribe((value) => values.push(value));

    expect(values).toEqual([1]);
    expect(result).toBeInstanceOf(Observable);
    expect(result).not.toBeInstanceOf(Subject);
    expect('next' in result).toBe(false);
  });

  it('returns a distinct Observable view without Subject mutation methods', () => {
    const subject = new Subject<number>();
    const view = subject.asObservable();

    expectTypeOf(view).toEqualTypeOf<Observable<number>>();
    expect(view).not.toBe(subject);
    expect(view).toBeInstanceOf(Observable);
    expect(view).not.toBeInstanceOf(Subject);
    expect('next' in view).toBe(false);
    expect('error' in view).toBe(false);
    expect('complete' in view).toBe(false);
    expect(Object.hasOwn(Observable.prototype, 'asObservable')).toBe(false);
  });

  it('mirrors values, errors, and completion from the Subject', () => {
    const failure = new Error('subject failed');
    const erroredSubject = new Subject<number>();
    const erroredResults: unknown[] = [];
    erroredSubject.asObservable().subscribe({
      next: (value) => erroredResults.push(value),
      error: (error) => erroredResults.push(error),
    });

    erroredSubject.next(1);
    erroredSubject.error(failure);

    const completedSubject = new Subject<number>();
    const completedResults: Array<number | 'complete'> = [];
    completedSubject.asObservable().subscribe({
      next: (value) => completedResults.push(value),
      complete: () => completedResults.push('complete'),
    });

    completedSubject.next(2);
    completedSubject.complete();

    expect(erroredResults).toEqual([1, failure]);
    expect(completedResults).toEqual([2, 'complete']);
  });

  it('preserves terminal state for observers that subscribe late to a view', () => {
    const completedSubject = new Subject<void>();
    const completedView = completedSubject.asObservable();
    let completed = false;
    completedSubject.complete();
    completedView.subscribe({
      complete: () => {
        completed = true;
      },
    });

    const failure = new Error('late failure');
    const erroredSubject = new Subject<void>();
    const erroredView = erroredSubject.asObservable();
    let receivedError: unknown;
    erroredSubject.error(failure);
    erroredView.subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    expect(completed).toBe(true);
    expect(receivedError).toBe(failure);
  });

  it('shares one view activation and cancels it only after the final observer leaves', () => {
    const subject = new Subject<number>();
    const subscribeSpy = vi.spyOn(subject, 'subscribe');
    const view = subject.asObservable();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartedController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    view.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    view.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    expect(subscribeSpy).toHaveBeenCalledTimes(1);

    subject.next(1);
    firstController.abort();
    subject.next(2);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1, 2]);
    expect(subscribeSpy).toHaveBeenCalledTimes(1);

    secondController.abort();
    view.subscribe((value) => restartedValues.push(value), { signal: restartedController.signal });
    expect(subscribeSpy).toHaveBeenCalledTimes(2);

    subject.next(3);
    expect(restartedValues).toEqual([3]);
    restartedController.abort();
  });
});
