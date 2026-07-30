import { afterEach, describe, expect, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { replaySubject } from './replay-subject.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('replaySubject', () => {
  it('replays its size-bounded buffer before cached completion', () => {
    const subject = replaySubject<number>({ size: 2 });
    const values: number[] = [];
    let completions = 0;

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();
    subject.subscribe({
      next: (value) => values.push(value),
      complete: () => completions++,
    });

    expect(values).toEqual([2, 3]);
    expect(completions).toBe(1);
  });

  it('replays its buffer before the exact cached error', () => {
    const failure = new Error('subject failed');
    const subject = replaySubject<number>({ size: 1 });
    const values: number[] = [];
    const errors: unknown[] = [];

    subject.next(1);
    subject.next(2);
    subject.error(failure);
    subject.subscribe({
      next: (value) => values.push(value),
      error: (error) => errors.push(error),
    });

    expect(values).toEqual([2]);
    expect(errors).toEqual([failure]);
  });

  it('preserves active hot fanout and host-time trimming before a terminal replay', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const subject = replaySubject<number>({ size: 2, maxAge: 100 });
    const firstValues: number[] = [];
    const activeLateValues: number[] = [];
    const terminalLateValues: number[] = [];
    const fullyExpiredValues: number[] = [];
    let terminalLateCompletions = 0;
    let fullyExpiredCompletions = 0;

    subject.subscribe((value) => firstValues.push(value));
    subject.next(1);
    vi.advanceTimersByTime(50);
    subject.next(2);
    subject.subscribe((value) => activeLateValues.push(value));

    expect(activeLateValues).toEqual([1, 2]);

    subject.complete();
    vi.advanceTimersByTime(51);
    subject.subscribe({
      next: (value) => terminalLateValues.push(value),
      complete: () => terminalLateCompletions++,
    });

    expect(firstValues).toEqual([1, 2]);
    expect(terminalLateValues).toEqual([2]);
    expect(terminalLateCompletions).toBe(1);

    vi.advanceTimersByTime(50);
    subject.subscribe({
      next: (value) => fullyExpiredValues.push(value),
      complete: () => fullyExpiredCompletions++,
    });

    expect(fullyExpiredValues).toEqual([]);
    expect(fullyExpiredCompletions).toBe(1);
  });

  it('joins live fanout before replaying the remaining active buffer', () => {
    const subject = replaySubject<number>({ size: 2 });
    const values: number[] = [];

    subject.next(1);
    subject.next(2);
    subject.subscribe((value) => {
      values.push(value);
      if (value === 1) {
        subject.next(3);
      }
    });

    expect(values).toEqual([1, 3, 2]);
  });
});
