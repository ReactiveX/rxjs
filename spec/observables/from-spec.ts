import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';

declare const {asDiagram, expectObservable, Symbol, type};
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {from} */
describe('Observable.from', () => {
  asDiagram('from([10, 20, 30])')
  ('should create an observable from an array', () => {
    const e1 = Observable.from([10, 20, 30])
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      .concatMap((x, i) => Observable.of(x).delay(i === 0 ? 0 : 20, rxTestScheduler));
    const expected = 'x-y-(z|)';
    expectObservable(e1).toBe(expected, {x: 10, y: 20, z: 30});
  });

  it('should throw for non observable object', () => {
    const r = () => {
      Observable.from(<any>{}).subscribe();
    };

    expect(r).to.throw();
  });

  it('should return T for ObservableLike objects', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let o1: Rx.Observable<number> = Observable.from(<number[]>[], Rx.Scheduler.asap);
      let o2: Rx.Observable<{ a: string }> = Observable.from(Observable.empty<{ a: string }>());
      let o3: Rx.Observable<{ b: number }> = Observable.from(new Promise<{b: number}>(resolve => resolve()));
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should return T for arrays', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let o1: Rx.Observable<number> = Observable.from(<number[]>[], Rx.Scheduler.asap);
      /* tslint:enable:no-unused-variable */
    });
  });

  const fakervable = (...values) => ({
    [<symbol>Symbol.observable]: () => ({
      subscribe: (observer: Rx.Observer<string>) => {
        for (const value of values) {
          observer.next(value);
        }
        observer.complete();
      }
    })
  });

  const fakerator = (...values) => ({
    [<symbol>Symbol.iterator]: () => {
      const clone = [...values];
      return {
        next: () => ({
          done: clone.length <= 0,
          value: clone.shift()
        })
      };
    }
  });

  const sources: { name: string, value: any }[] = [
    { name: 'observable', value: Observable.of('x') },
    { name: 'observable-like', value: fakervable('x') },
    { name: 'array', value: ['x'] },
    { name: 'promise', value: Promise.resolve('x') },
    { name: 'iterator', value: fakerator('x') },
    { name: 'array-like', value: { [0]: 'x', length: 1 }},
    { name: 'string', value: 'x'},
    { name: 'arguments', value: function(x) { return arguments; }('x') },
  ];

  for (const source of sources) {
    it(`should accept ${source.name}`, (done: MochaDone) => {
      let nextInvoked = false;
      Observable.from(source.value)
        .subscribe(
          (x: string) => {
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
    it(`should accept ${source.name} and scheduler`, (done: MochaDone) => {
      let nextInvoked = false;
      Observable.from(source.value, Rx.Scheduler.async)
        .subscribe(
          (x: string) => {
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
  }
});
