
import * as pipe from '../../dist/cjs/pipe';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

describe('map-let-pipe', () => {
  it('should let through the map operator', () => {
    const s1 = cold( '---a--b--c--|');
    const project = x => x + x;
    expectObservable(pipe.map(project)(s1)).toBe(s1.map(project));
  });

  it('should work with Observable.prototype.let', () => {
    const values = {
      a: 1,
      b: 2,
      c: 3,
      x: 1,
      y: 1.5,
      z: 2
    };

    const s1 = cold( '---a---b---c---|', values);
    const expected = '---x---y---z---|';
    const { map } = pipe;

    const t1 = s1.let(
      map((x: number) => x + 1),
      map((x: number) => x / 2)
    );

    expectObservable(t1).toBe(expected, values);
  });
});
