import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { asyncScheduler, of, from, Observable, asapScheduler, Observer, observable, Subject, EMPTY } from 'rxjs';
import { first, concatMap, delay } from 'rxjs/operators';

// tslint:disable:no-any
declare const asDiagram: any;
declare const expectObservable: any;
declare const type: any;
declare const rxTestScheduler: TestScheduler;
// tslint:enable:no-any

function getArguments<T>(...args: T[]) {
  return arguments;
}

/** @test {from} */
describe('from', () => {
  asDiagram('from([10, 20, 30])')
  ('should create an observable from an array', () => {
    const e1 = from([10, 20, 30]).pipe(
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      concatMap((x, i) => of(x).pipe(
        delay(i === 0 ? 0 : 20, rxTestScheduler))
      )
    );
    const expected = 'x-y-(z|)';
    expectObservable(e1).toBe(expected, {x: 10, y: 20, z: 30});
  });

  it('should throw for non observable object', () => {
    const r = () => {
      // tslint:disable-next-line:no-any needed for the test
      from({} as any).subscribe();
    };

    expect(r).to.throw();
  });

  type('should return T for InteropObservable objects', () => {
    /* tslint:disable:no-unused-variable */
    const o1: Observable<number> = from([] as number[], asapScheduler);
    const o2: Observable<{ a: string }> = from(EMPTY);
    const o3: Observable<{ b: number }> = from(new Promise<{b: number}>(resolve => resolve()));
    /* tslint:enable:no-unused-variable */
  });

  type('should return T for arrays', () => {
    /* tslint:disable:no-unused-variable */
    const o1: Observable<number> = from([] as number[], asapScheduler);
    /* tslint:enable:no-unused-variable */
  });

  const fakervable = <T>(...values: T[]) => ({
    [observable]: () => ({
      subscribe: (observer: Observer<T>) => {
        for (const value of values) {
          observer.next(value);
        }
        observer.complete();
      }
    })
  });

  const fakeArrayObservable = <T>(...values: T[]) => {
    let arr = ['bad array!'];
    arr[observable] = () =>  {
      return {
        subscribe: (observer: Observer<T>) => {
          for (const value of values) {
            observer.next(value);
          }
          observer.complete();
        }
      };
    };
    return arr;
  };

  const fakerator = <T>(...values: T[]) => ({
    [Symbol.iterator as symbol]: () => {
      const clone = [...values];
      return {
        next: () => ({
          done: clone.length <= 0,
          value: clone.shift()
        })
      };
    }
  });

  // tslint:disable-next-line:no-any it's silly to define all of these types.
  const sources: Array<{ name: string, value: any }> = [
    { name: 'observable', value: of('x') },
    { name: 'observable-like', value: fakervable('x') },
    { name: 'observable-like-array', value: fakeArrayObservable('x') },
    { name: 'array', value: ['x'] },
    { name: 'promise', value: Promise.resolve('x') },
    { name: 'iterator', value: fakerator('x') },
    { name: 'array-like', value: { [0]: 'x', length: 1 }},
    { name: 'string', value: 'x'},
    { name: 'arguments', value: getArguments('x') },
  ];

  for (const source of sources) {
    it(`should accept ${source.name}`, (done) => {
      let nextInvoked = false;
      from(source.value)
        .subscribe(
          (x) => {
            nextInvoked = true;
            expect(x).to.equal('x');
          },
          (x) => {
            done(new Error('should not be called'));
          },
          () => {
            expect(nextInvoked).to.equal(true);
            done();
          }
        );
    });
    it(`should accept ${source.name} and scheduler`, (done) => {
      let nextInvoked = false;
      from(source.value, asyncScheduler)
        .subscribe(
          (x) => {
            nextInvoked = true;
            expect(x).to.equal('x');
          },
          (x) => {
            done(new Error('should not be called'));
          },
          () => {
            expect(nextInvoked).to.equal(true);
            done();
          }
        );
      expect(nextInvoked).to.equal(false);
    });
    it(`should accept a function`, (done) => {
      const subject = new Subject();
      const handler = (...args: any[]) => subject.next(...args);
      handler[observable] = () => subject;
      let nextInvoked = false;

      from((handler as any)).pipe(first()).subscribe(
        (x) => {
          nextInvoked = true;
          expect(x).to.equal('x');
        },
        (x) => {
          done(new Error('should not be called'));
        },
        () => {
          expect(nextInvoked).to.equal(true);
          done();
        }
      );
      handler('x');
    });
  }
});
