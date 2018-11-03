import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { merge, of, Observable, defer, asyncScheduler } from 'rxjs';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';
import { lowerCaseO } from '../test_helpers/lowerCaseO';

/** @test {merge} */
describe('merge', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  it('should merge cold and cold', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  cold('---a-----b-----c----|');
      const e1subs =   '^                   !';
      const e2 =  cold('------x-----y-----z----|');
      const e2subs =   '^                      !';
      const expected = '---a--x--b--y--c--z----|';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge hot and hot', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  hot('---a---^-b-----c----|');
      const e1subs =         '^            !';
      const e2 =  hot('-----x-^----y-----z----|');
      const e2subs =         '^               !';
      const expected =       '--b--y--c--z----|';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge hot and cold', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =  hot('---a-^---b-----c----|');
      const e1subs =       '^              !';
      const e2 =  cold(    '--x-----y-----z----|');
      const e2subs =       '^                  !';
      const expected =     '--x-b---y-c---z----|';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge parallel emissions', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('---a----b----c----|');
      const e1subs =   '^                 !';
      const e2 =   hot('---x----y----z----|');
      const e2subs =   '^                 !';
      const expected = '---(ax)-(by)-(cz)-|';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge empty and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('|');
      const e1subs = '(^!)';
      const e2 = cold('|');
      const e2subs = '(^!)';

      const result = merge(e1, e2);

      expectObservable(result).toBe('|');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge three empties', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('|');
      const e1subs = '(^!)';
      const e2 = cold('|');
      const e2subs = '(^!)';
      const e3 = cold('|');
      const e3subs = '(^!)';

      const result = merge(e1, e2, e3);

      expectObservable(result).toBe('|');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
      expectSubscriptionsTo(e3).toBe(e3subs);
    });
  });

  it('should merge never and empty', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('-');
      const e1subs =  '^';
      const e2 = cold('|');
      const e2subs =  '(^!)';

      const result = merge(e1, e2);

      expectObservable(result).toBe('-');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge never and never', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('-');
      const e1subs =  '^';
      const e2 = cold('-');
      const e2subs =  '^';

      const result = merge(e1, e2);

      expectObservable(result).toBe('-');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge empty and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('|');
      const e1subs =  '(^!)';
      const e2 = cold('#');
      const e2subs =  '(^!)';

      const result = merge(e1, e2);

      expectObservable(result).toBe('#');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge hot and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot('--a--b--c--|');
      const e1subs = '(^!)';
      const e2 = cold('#');
      const e2subs =  '(^!)';

      const result = merge(e1, e2);

      expectObservable(result).toBe('#');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge never and throw', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('-');
      const e1subs =  '(^!)';
      const e2 = cold('#');
      const e2subs =  '(^!)';

      const result = merge(e1, e2);

      expectObservable(result).toBe('#');
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge empty and eventual error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = cold('|');
      const e1subs =  '(^!)';
      const e2 =    hot('-------#');
      const e2subs =    '^------!';
      const expected =  '-------#';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge hot and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 =   hot('--a--b--c--|');
      const e1subs =   '^      !    ';
      const e2 =   hot('-------#    ');
      const e2subs =   '^      !    ';
      const expected = '--a--b-#    ';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge never and error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = hot(   '-');
      const e1subs =    '^      !';
      const e2 =    hot('-------#');
      const e2subs =    '^      !';
      const expected =  '-------#';

      const result = merge(e1, e2);

      expectObservable(result).toBe(expected);
      expectSubscriptionsTo(e1).toBe(e1subs);
      expectSubscriptionsTo(e2).toBe(e2subs);
    });
  });

  it('should merge single lowerCaseO into RxJS Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = lowerCaseO('a', 'b', 'c');

      const result = merge(e1);

      expectObservable(result).toBe('(abc|)');
    });
  });

  it('should merge two lowerCaseO into RxJS Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = lowerCaseO('a', 'b', 'c');
      const e2 = lowerCaseO('d', 'e', 'f');

      const result = merge(e1, e2);

      expectObservable(result).toBe('(abcdef|)');
    });
  });
});

// describe('merge(...observables, Scheduler)', () => {
//   it('should merge single lowerCaseO into RxJS Observable', () => {
//     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
//       const e1 = lowerCaseO('a', 'b', 'c');

//       const result = merge(e1, testScheduler);

//       expect(result).to.be.instanceof(Observable);
//       expectObservable(result).toBe('(abc|)');
//     });
//   });
// });

// describe('merge(...observables, Scheduler, number)', () => {
//   it('should handle concurrency limits', () => {
//     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
//       const e1 =  cold('---a---b---c---|');
//       const e2 =  cold('-d---e---f--|');
//       const e3 =  cold(            '---x---y---z---|');
//       const expected = '-d-a-e-b-f-c---x---y---z---|';
//       expectObservable(merge(e1, e2, e3, 2)).toBe(expected);
//     });
//   });

//   it('should handle scheduler', () => {
//     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
//       const e1 =  of('a');
//       const e2 =  of('b').delay(20, testScheduler);
//       const expected = 'a-(b|)';

//       expectObservable(merge(e1, e2, testScheduler)).toBe(expected);
//     });
//   });

//   it('should handle scheduler with concurrency limits', () => {
//     testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
//       const e1 =  cold('---a---b---c---|');
//       const e2 =  cold('-d---e---f--|');
//       const e3 =  cold(            '---x---y---z---|');
//       const expected = '-d-a-e-b-f-c---x---y---z---|';
//       expectObservable(merge(e1, e2, e3, 2, testScheduler)).toBe(expected);
//     });
//   });

//   it('should use the scheduler even when one Observable is merged', (done) => {
//     let e1Subscribed = false;
//     const e1 = defer(() => {
//       e1Subscribed = true;
//       return of('a');
//     });

//     merge(e1, asyncScheduler)
//       .subscribe({
//         error: done,
//         complete: () => {
//           expect(e1Subscribed).to.be.true;
//           done();
//         }
//       });

//     expect(e1Subscribed).to.be.false;
//   });
// });
