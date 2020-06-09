import { Subject } from 'rxjs';

describe('Subject', () => {
  it('should handle no generic appropriately', () => {
    const s1 = new Subject(); // $ExpectType Subject<unknown>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.subscribe(value => {
      const x = value; // $ExpectType unknown
    });
  });

  it('should handle a generic of string appropriately', () => {
    const s1 = new Subject<string>(); // $ExpectType Subject<string>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.next(32); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType string
    });
  });

  it('should handle a generic of void appropriately', () => {
    const s1 = new Subject<void>(); // $ExpectType Subject<void>
    s1.next(); // $ExpectType void
    s1.next(undefined); // $ExpectType void
    s1.next('test'); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType void
    });
  });

  it('should not accept an argument in the ctor', () => {
    const s1 = new Subject<number>(subscriber => { }); // $ExpectError
  });

  describe('asObservable', () => {
    it('should return an observable of the same generic type', () => {
      const s1 = new Subject();
      const o1 = s1.asObservable(); // $ExpectType Observable<unknown>

      const s2 = new Subject<string>();
      const o2 = s2.asObservable(); // $ExpectType Observable<string>
    });
  });
});