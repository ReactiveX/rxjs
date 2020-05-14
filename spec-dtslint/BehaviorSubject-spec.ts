import { BehaviorSubject } from 'rxjs';

describe('BehaviorSubject', () => {
  it('should handle no generic appropriately', () => {
    const s1 = new BehaviorSubject(); // $ExpectError
  });

  it('should handle an argument of string appropriately', () => {
    const init = 'some string';
    const s1 = new BehaviorSubject(init); // $ExpectType BehaviorSubject<string>
    s1.next(); // $ExpectError
    s1.next('test'); // $ExpectType void
    s1.next(32); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType string
    });
    const v = s1.getValue(); // $ExpectType string
  });

  it('should handle a generic of void appropriately', () => {
    const s1 = new BehaviorSubject<void>(undefined); // $ExpectType BehaviorSubject<void>
    s1.next(); // $ExpectType void
    s1.next('test'); // $ExpectError
    s1.next(32); // $ExpectError
    s1.subscribe(value => {
      const x = value; // $ExpectType void
    });
    const v = s1.getValue(); // $ExpectType void
  });

  describe('asObservable', () => {
    it('should return an observable of the same generic type', () => {
      const s1 = new BehaviorSubject('test');
      const o1 = s1.asObservable(); // $ExpectType Observable<string>

      const s2 = new BehaviorSubject<void>(undefined);
      const o2 = s2.asObservable(); // $ExpectType Observable<void>
    });
  });
});