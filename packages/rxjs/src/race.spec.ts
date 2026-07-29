import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { race } from './race.js';

describe('race', () => {
  it('selects completion as the winning notification', () => {
    let losingSourceSubscribed = false;
    let completed = false;
    const source = new Observable<void>((subscriber) => subscriber.complete());
    const losingSource = new Observable<void>(() => {
      losingSourceSubscribed = true;
    });

    source[race]([losingSource]).subscribe({
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
    expect(losingSourceSubscribed).toBe(false);
  });

  it('cancels losing sources and propagates downstream cancellation to the winner', () => {
    let firstSubscriber: Subscriber<string> | undefined;
    let secondSubscriber: Subscriber<string> | undefined;
    let firstTeardowns = 0;
    let secondTeardowns = 0;
    const values: string[] = [];
    const downstream = new AbortController();
    const first = new Observable<string>((subscriber) => {
      firstSubscriber = subscriber;
      subscriber.addTeardown(() => {
        firstTeardowns++;
      });
    });
    const second = new Observable<string>((subscriber) => {
      secondSubscriber = subscriber;
      subscriber.addTeardown(() => {
        secondTeardowns++;
      });
    });

    first[race]([second]).subscribe((value) => values.push(value), { signal: downstream.signal });
    firstSubscriber?.next('winner');

    expect(values).toEqual(['winner']);
    expect(firstTeardowns).toBe(0);
    expect(secondTeardowns).toBe(1);

    downstream.abort();

    expect(firstTeardowns).toBe(1);
    expect(secondTeardowns).toBe(1);
    expect(secondSubscriber?.active).toBe(false);
  });
});
