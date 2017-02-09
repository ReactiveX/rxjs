import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

/** @test {pairwise} */
describe('Observable.prototype.pairwise', () => {
  asDiagram('pairwise')('should group consecutive emissions as arrays of two', () => {
    const e1 =   hot('--a--b-c----d--e---|');
    const expected = '-----u-v----w--x---|';

    const values = {
      u: ['a', 'b'],
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e']
    };

    const source = (<any>e1).pairwise();

    expectObservable(source).toBe(expected, values);
  });

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
