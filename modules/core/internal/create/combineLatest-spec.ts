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
  console.log('before combine test');

  it('should combine the latest values of multiple observables', () => {
    const results: any[] = [];

    const s1 = of(1);
    const s2 = of(2);
    const s3 = of(3);

    combineLatest(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });
  });

  it('should combine the latest values of multiple observables with fakeAsync', fakeAsyncTest(() => {
    const results: any[] = [];
    const s1 = createIntervalObservable(1000);
    const s2 = createIntervalObservable(2000);
    const s3 = createIntervalObservable(3000);
    combineLatest(s1, s2, s3).subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });
    expect(results).toEqual([]);
    tick(1000);
    expect(results).toEqual([]);
    tick(1000);
    expect(results).toEqual([]);
    tick(1000);
    expect(results).toEqual([3, 2, 1]);
    clearAllMacrotasks();
  }));
});
