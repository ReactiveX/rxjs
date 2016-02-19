import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.prototype.pairwise()', () => {
  it('should pairwise things', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--|');
    const e1subs =      '^                    !';
    const expected =    '------v--w--x--y--z--|';

    const values = {
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e'],
      y: ['e', 'f'],
      z: ['f', 'g']
    };

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not emit on single-element streams', () => {
    const e1 = hot('-----^--b----|');
    const e1subs =      '^       !';
    const expected =    '--------|';

    const values = {
    };

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle mid-stream throw', () => {
    const e1 = hot('--a--^--b--c--d--e--#');
    const e1subs =      '^              !';
    const expected =    '------v--w--x--#';

    const values = {
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e']
    };

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
