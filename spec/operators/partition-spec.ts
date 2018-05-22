import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

const Observable = Rx.Observable;

/** @test {partition} */
describe('Observable.prototype.partition', () => {
  function expectObservableArray(result: Rx.Observable<string>[], expected: string[]) {
    for (let idx = 0; idx < result.length; idx++ ) {
      expectObservable(result[idx]).toBe(expected[idx]);
    }
  }

  asDiagram('partition(x => x % 2 === 1)')('should partition an observable of ' +
  'integers into even and odd', () => {
    const e1 =    hot('--1-2---3------4--5---6--|');
    const e1subs =    '^                        !';
    const expected = ['--1-----3---------5------|',
                    '----2----------4------6--|'];

    const result = e1.partition((x: any) => x % 2 === 1);

    expectObservableArray(result, expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition an observable into two using a predicate', () => {
    const e1 =    hot('--a-b---a------d--a---c--|');
    const e1subs =    '^                        !';
    const expected = ['--a-----a---------a------|',
                    '----b----------d------c--|'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition an observable into two using a predicate that takes an index', () => {
    const e1 =    hot('--a-b---a------d--e---c--|');
    const e1subs =    '^                        !';
    const expected = ['--a-----a---------e------|',
                      '----b----------d------c--|'];

    function predicate(value: string, index: number) {
      return index % 2 === 0;
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition an observable into two using a predicate and thisArg', () => {
    const e1 =    hot('--a-b---a------d--a---c--|');
    const e1subs =    '^                        !';
    const expected = ['--a-----a---------a------|',
                    '----b----------d------c--|'];

    function predicate(this: any, x: string) {
      return x === this.value;
    }

    expectObservableArray(e1.partition(predicate, {value: 'a'}), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should pass errors to both returned observables', () => {
    const e1 =    hot('--a-b---#');
    const e1subs =    '^       !';
    const expected = ['--a-----#',
                    '----b---#'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should pass errors to both returned observables if source throws', () => {
    const e1 =   cold('#');
    const e1subs =    '(^!)';
    const expected = ['#',
                    '#'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should pass errors to both returned observables if predicate throws', () => {
    const e1 =    hot('--a-b--a--|');
    const e1subs =    '^      !   ';
    const expected = ['--a----#   ',
                    '----b--#   '];

    let index = 0;
    const error = 'error';
    function predicate(x: string) {
      const match = x === 'a';
      if (match && index++ > 1) {
        throw error;
      }
      return match;
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition empty observable if source does not emits', () => {
    const e1 =    hot('----|');
    const e1subs =    '^   !';
    const expected = ['----|',
                    '----|'];

    function predicate(x: string) {
      return x === 'x';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition empty observable if source is empty', () => {
    const e1 =   cold('|');
    const e1subs =    '(^!)';
    const expected = ['|',
                    '|'];

    function predicate(x: string) {
      return x === 'x';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition if source emits single elements', () => {
    const e1 =    hot('--a--|');
    const e1subs =    '^    !';
    const expected = ['--a--|',
                    '-----|'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition if predicate matches all of source elements', () => {
    const e1 =    hot('--a--a--a--a--a--a--a--|');
    const e1subs =    '^                      !';
    const expected = ['--a--a--a--a--a--a--a--|',
                    '-----------------------|'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition if predicate does not match all of source elements', () => {
    const e1 =    hot('--b--b--b--b--b--b--b--|');
    const e1subs =    '^                      !';
    const expected = ['-----------------------|',
                    '--b--b--b--b--b--b--b--|'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition to infinite observable if source does not completes', () => {
    const e1 =    hot('--a-b---a------d----');
    const e1subs =    '^                   ';
    const expected = ['--a-----a-----------',
                    '----b----------d----'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition to infinite observable if source never completes', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const expected = ['-',
                    '-'];

    function predicate(x: string) {
      return x === 'a';
    }

    expectObservableArray(e1.partition(predicate), expected);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should partition into two observable with early unsubscription', () => {
    const e1 =    hot('--a-b---a------d-|');
    const unsub =     '       !          ';
    const e1subs =    '^      !          ';
    const expected = ['--a-----          ',
                    '----b---          '];

    function predicate(x: string) {
      return x === 'a';
    }
    const result = e1.partition(predicate);

    for (let idx = 0; idx < result.length; idx++ ) {
      expectObservable(result[idx], unsub).toBe(expected[idx]);
    }
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =    hot('--a-b---a------d-|');
    const e1subs =    '^      !          ';
    const expected = ['--a-----          ',
                    '----b---          '];
    const unsub =     '       !          ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .partition((x: string) => x === 'a')
      .map((observable: Rx.Observable<string>) =>
        observable.mergeMap((x: string) => Observable.of(x)));

    expectObservable(result[0], unsub).toBe(expected[0]);
    expectObservable(result[1], unsub).toBe(expected[1]);
    expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
  });

  it('should accept thisArg', () => {
    const thisArg = {};

    Observable.of(1).partition(function (this: any, value: number) {
      expect(this).to.deep.equal(thisArg);
      return true;
    }, thisArg)
      .forEach((observable: Rx.Observable<number>) => observable.subscribe());
  });
});
