/** @prettier */
import { expect } from 'chai';
import type { Observable} from 'rxjs';
import { partition, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {partition} */
describe('partition', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  function expectObservableArray(result: Observable<string>[], expected: string[]) {
    for (let idx = 0; idx < result.length; idx++) {
      rxTestScheduler.expectObservable(result[idx]).toBe(expected[idx]);
    }
  }

  it('should partition an observable of integers into even and odd', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --1-2---3------4--5---6--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
        '                --1-----3---------5------|',
        '                ----2----------4------6--|',
      ];

      const result = partition(e1, (x: any) => x % 2 === 1);

      expectObservableArray(result, expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition an observable into two using a predicate', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d--a---c--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
        '                --a-----a---------a------|',
        '                ----b----------d------c--|',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition an observable into two using a predicate that takes an index', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d--a---c--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
        '                --a-----a---------a------|',
        '                ----b----------d------c--|',
      ];

      function predicate(value: string, index: number) {
        return index % 2 === 0;
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition an observable into two using a predicate and thisArg', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d--a---c--|');
      const e1subs = '   ^------------------------!';
      // prettier-ignore
      const expected = [
        '                --a-----a---------a------|',
        '                ----b----------d------c--|',
      ];

      function predicate(this: any, x: string) {
        return x === this.value;
      }

      expectObservableArray(partition(e1, predicate, { value: 'a' }), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should pass errors to both returned observables', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a-b---#');
      const e1subs = '   ^-------!';
      // prettier-ignore
      const expected = [
        '                --a-----#',
        '                ----b---#',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should pass errors to both returned observables if source throws', () => {
    rxTestScheduler.run(({ cold, expectSubscriptions }) => {
      const e1 = cold('  #   ');
      const e1subs = '   (^!)';
      // prettier-ignore
      const expected = [
        '                 #  ',
        '                 #  ',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should pass errors to both returned observables if predicate throws', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a-b--a--|');
      const e1subs = '   ^------!   ';
      // prettier-ignore
      const expected = [
        '                --a----#   ',
        '                ----b--#   ',
      ];

      let index = 0;
      const error = 'error';
      function predicate(x: string) {
        const match = x === 'a';
        if (match && index++ > 1) {
          throw error;
        }
        return match;
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition empty observable if source does not emits', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   ----|');
      const e1subs = '   ^---!';
      // prettier-ignore
      const expected = [
        '                ----|',
        '                ----|',
      ];

      function predicate(x: string) {
        return x === 'x';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition empty observable if source is empty', () => {
    rxTestScheduler.run(({ cold, expectSubscriptions }) => {
      const e1 = cold('  |   ');
      const e1subs = '   (^!)';
      // prettier-ignore
      const expected = [
        '                |   ',
        '                |   ',
      ];

      function predicate(x: string) {
        return x === 'x';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition if source emits single elements', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a--|');
      const e1subs = '   ^----!';
      // prettier-ignore
      const expected = [
        '                --a--|',
        '                -----|',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition if predicate matches all of source elements', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a--a--a--a--a--a--a--|');
      const e1subs = '   ^----------------------!';
      // prettier-ignore
      const expected = [
        '                --a--a--a--a--a--a--a--|',
        '                -----------------------|',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition if predicate does not match all of source elements', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --b--b--b--b--b--b--b--|');
      const e1subs = '   ^----------------------!';
      // prettier-ignore
      const expected = [
        '                -----------------------|',
        '                --b--b--b--b--b--b--b--|',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition to infinite observable if source does not completes', () => {
    rxTestScheduler.run(({ hot, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d----');
      const e1subs = '   ^-------------------';
      // prettier-ignore
      const expected = [
        '                --a-----a-----------',
        '                ----b----------d----',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition to infinite observable if source never completes', () => {
    rxTestScheduler.run(({ cold, expectSubscriptions }) => {
      const e1 = cold('  -');
      const e1subs = '   ^';
      // prettier-ignore
      const expected = [
        '                -',
        '                -',
      ];

      function predicate(x: string) {
        return x === 'a';
      }

      expectObservableArray(partition(e1, predicate), expected);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should partition into two observable with early unsubscription', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d-|');
      const unsub = '    -------!          ';
      const e1subs = '   ^------!          ';
      // prettier-ignore
      const expected = [
        '                --a-----          ',
        '                ----b---          ',
      ];

      function predicate(x: string) {
        return x === 'a';
      }
      const result = partition(e1, predicate);

      for (let idx = 0; idx < result.length; idx++) {
        expectObservable(result[idx], unsub).toBe(expected[idx]);
      }
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   --a-b---a------d-|');
      const e1subs = '   ^------!          ';
      // prettier-ignore
      const expected = [
        '                --a-----          ',
        '                ----b---          ',
      ];
      const unsub = '    -------!          ';

      const e1Pipe = e1.pipe(mergeMap((x: string) => of(x)));
      const result = partition(e1Pipe, (x: string) => x === 'a');

      expectObservable(result[0], unsub).toBe(expected[0]);
      expectObservable(result[1], unsub).toBe(expected[1]);
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should accept thisArg', () => {
    const thisArg = {};

    partition(
      of(1),
      function (this: any, value: number) {
        expect(this).to.deep.equal(thisArg);
        return true;
      },
      thisArg
    ).forEach((observable: Observable<number>) => observable.subscribe());
  });
});
