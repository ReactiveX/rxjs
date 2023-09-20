import { AsyncSubject } from 'rxjs';

describe('AsyncSubject', () => {
  it('should handle no generic appropriately', () => {
    const s1 = new AsyncSubject(); // $ExpectType AsyncSubject<unknown>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.subscribe(value => {
      const x = value; // $ExpectType unknown
    });
  });

  it('should handle a generic of string appropriately', () => {
    const s1 = new AsyncSubject<string>(); // $ExpectType AsyncSubject<string>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.next(32); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType string
    });
  });

  it('should handle a generic of void appropriately', () => {
    const s1 = new AsyncSubject<void>(); // $ExpectType AsyncSubject<void>
    s1.next(); // $ExpectType void
    s1.next(undefined); // $ExpectType void
    s1.next('test'); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType void
    });
  });

  describe('asObservable', () => {
    it('should return an observable of the same generic type', () => {
      const s1 = new AsyncSubject();
      const o1 = s1.asObservable(); // $ExpectType Observable<unknown>

      const s2 = new AsyncSubject<string>();
      const o2 = s2.asObservable(); // $ExpectType Observable<string>
    });
  });
});