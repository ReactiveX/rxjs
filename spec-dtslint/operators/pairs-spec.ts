/** @prettier */
import { pairs, asyncScheduler } from 'rxjs';

describe('pairs', () => {
  it('should work unscheduled', () => {
    const o1 = pairs({ foo: 1, bar: 2 }); // $ExpectType Observable<["foo" | "bar", number]>
    const o2 = pairs([1, 2, 3, 4]); // $ExpectType Observable<[string, number]>
    const o3 = pairs(123); // $ExpectType Observable<[never, never]>
    const o4 = pairs('blah'); // $ExpectType Observable<[string, string]>
    const o5 = pairs({}); // $ExpectType Observable<[never, never]>
    const o6 = pairs(true); // $ExpectType Observable<[never, never]>
    const o7 = pairs(null); // $ExpectError
    const o8 = pairs(undefined); // $ExpectError
  });

  it('should work scheduled', () => {
    const o1 = pairs({ foo: 1, bar: 2 }, asyncScheduler); // $ExpectType Observable<["foo" | "bar", number]>
    const o2 = pairs([1, 2, 3, 4], asyncScheduler); // $ExpectType Observable<[string, number]>
    const o3 = pairs(123, asyncScheduler); // $ExpectType Observable<[never, never]>
    const o4 = pairs('blah', asyncScheduler); // $ExpectType Observable<[string, string]>
    const o5 = pairs({}, asyncScheduler); // $ExpectType Observable<[never, never]>
    const o6 = pairs(true, asyncScheduler); // $ExpectType Observable<[never, never]>
    const o7 = pairs(null, asyncScheduler); // $ExpectError
    const o8 = pairs(undefined, asyncScheduler); // $ExpectError
  });
});
