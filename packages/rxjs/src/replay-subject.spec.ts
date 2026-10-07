import { afterEach, describe, expect, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { replaySubject } from './replay-subject.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('replaySubject', () => {
  it.each(['active', 'complete', 'error'] as const)(
    'checks host-time expiry before replaying to a late %s subscriber when timers are delayed',
    (state) => {
      vi.useFakeTimers();
      vi.setSystemTime(0);
      const subject = replaySubject<number>({ size: 3, maxAge: 100 });
      const liveValues: number[] = [];
      const replayedValues: number[] = [];
      const errors: unknown[] = [];
      const failure = new Error('retained error');
      let completions = 0;

      subject.subscribe((value) => liveValues.push(value));
      subject.next(1);
      vi.setSystemTime(50);
      subject.next(2);
      if (state === 'complete') {
        subject.complete();
      } else if (state === 'error') {
        subject.error(failure);
      }

      // Advancing wall time without running timers models a delayed host callback.
      vi.setSystemTime(100);
      subject.subscribe({
        next: (value) => replayedValues.push(value),
        complete: () => completions++,
        error: (error) => errors.push(error),
      });

      expect(liveValues).toEqual([1, 2]);
      expect(replayedValues).toEqual([2]);
      expect(completions).toBe(state === 'complete' ? 1 : 0);
      expect(errors).toEqual(state === 'error' ? [failure] : []);

      if (state === 'active') {
        subject.next(3);
        expect(replayedValues).toEqual([2, 3]);
      }
    }
  );

  it('does not replay fully expired values before a delayed age timer runs', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const subject = replaySubject<number>({ maxAge: 100 });
    subject.next(1);
    vi.setSystemTime(101);
    const values: number[] = [];
    subject.subscribe((value) => values.push(value));
    expect(values).toEqual([]);
    subject.next(2);
    expect(values).toEqual([2]);
  });

  it('keeps unbounded replay independent of host-time changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const subject = replaySubject<number>({ size: 1 });
    subject.next(1);
    subject.next(2);
    vi.setSystemTime(100000);
    const values: number[] = [];
    subject.subscribe((value) => values.push(value));
    expect(values).toEqual([2]);
  });

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
