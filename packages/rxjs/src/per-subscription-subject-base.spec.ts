import '@rxjs/observable-polyfill';
import { describe, expect, it } from 'vitest';
import { PerSubscriptionSubjectBase } from './per-subscription-subject-base.js';

class TestPerSubscriptionSubject<T> extends PerSubscriptionSubjectBase<T> {
  setupCount = 0;

  constructor() {
    super();
  }

  protected override _subscribe(subscriber: Subscriber<T>): void {
    this.setupCount++;
    super._subscribe(subscriber);
  }
}

describe('PerSubscriptionSubjectBase', () => {
  it('runs _subscribe for every direct subscription while sharing hot fanout', () => {
    const subject = new TestPerSubscriptionSubject<number>();
    const first: number[] = [];
    const second: number[] = [];

    subject.subscribe((value) => first.push(value));
    subject.subscribe((value) => second.push(value));
    subject.next(1);

    expect(subject.setupCount).toBe(2);
    expect(first).toEqual([1]);
    expect(second).toEqual([1]);
  });

  it('retains completion for each late direct subscriber', () => {
    const subject = new TestPerSubscriptionSubject<number>();
    let completions = 0;

    subject.complete();
    subject.subscribe({ complete: () => completions++ });
    subject.subscribe({ complete: () => completions++ });

    expect(subject.setupCount).toBe(2);
    expect(completions).toBe(2);
  });

  it('retains errors for each late direct subscriber', () => {
    const subject = new TestPerSubscriptionSubject<number>();
    const expected = new Error('expected');
    const errors: unknown[] = [];

    subject.error(expected);
    subject.subscribe({ error: (error) => errors.push(error) });
    subject.subscribe({ error: (error) => errors.push(error) });

    expect(subject.setupCount).toBe(2);
    expect(errors).toEqual([expected, expected]);
  });
});
