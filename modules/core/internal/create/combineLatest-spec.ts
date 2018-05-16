import { of } from "./of";
import { combineLatest } from "./combineLatest";
import { Observable } from "../Observable";

function createIntervalObservable(interval: number) {
  return new Observable<number>(subscriber => {
    let i = 0;
    const id = setInterval(() => {
      subscriber.next(i++);
    }, interval);
    return () => clearInterval(id);
  });
}

// TODO: write a zone.js test to cover this with a timer
describe('combineLatest', () => {
  it('should combine the latest values of multiple observables', () => {
    const results: any[] = [];

    const s1 = of(1);
    const s2 = of(2);
    const s3 = of(3);

    combineLatest(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });
    expect(results).toEqual([[1, 2, 3]]);
  });

  it('should combine the latest values of multiple observables with fakeAsync', fakeAsyncTest(() => {
    const results: any[] = [];
    const s1 = createIntervalObservable(1000);
    const s2 = createIntervalObservable(1500);
    const s3 = createIntervalObservable(1800);
    combineLatest(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });
    expect(results).toEqual([]);
    tick(1000);
    expect(results).toEqual([]);
    tick(500);
    expect(results).toEqual([]);
    tick(300);
    expect(results).toEqual([[0, 0, 0]]);
    tick(300);
    expect(results).toEqual([[0, 0, 0], [1, 0, 0]]);
    clearAllMacrotasks();
  }));
});
