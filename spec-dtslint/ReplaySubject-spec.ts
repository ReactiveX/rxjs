import { ReplaySubject } from 'rxjs';

describe('ReplaySubject', () => {
  it('should handle no generic appropriately', () => {
    const s1 = new ReplaySubject(); // $ExpectType ReplaySubject<unknown>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.subscribe(value => {
      const x = value; // $ExpectType unknown
    });
  });

  it('should handle a generic of string appropriately', () => {
    const s1 = new ReplaySubject<string>(); // $ExpectType ReplaySubject<string>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.next(32); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType string
    });
  });

  it('should handle a generic of void appropriately', () => {
    const s1 = new ReplaySubject<void>(); // $ExpectType ReplaySubject<void>
    s1.next(); // $ExpectType void
    s1.next(undefined); // $ExpectType void
    s1.next('test'); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType void
    });
  });

  describe('asObservable', () => {
    it('should return an observable of the same generic type', () => {
      const s1 = new ReplaySubject();
      const o1 = s1.asObservable(); // $ExpectType Observable<unknown>

      const s2 = new ReplaySubject<string>();
      const o2 = s2.asObservable(); // $ExpectType Observable<string>
    });
  });
});