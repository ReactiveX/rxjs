
import * as fp from '../../dist/cjs/fp';
import { Observable } from '../../dist/cjs/Observable';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

describe('map-let-fp', () => {
  it('should let through the map operator', () => {
    const s1 = cold( '---a--b--c--|');
    const project = x => x + x;
    expectObservable(fp.map(s1, project)).toBe(s1.map(project));
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

    const s1: Observable<number> = cold( '---a---b---c---|', values);
    const expected = '---x---y---z---|';
    const { map } = fp;

    const t1 = s1.let(
      o => map(o, x => x + 1),
      o => map(o, x => x / 2)
    );

    expectObservable(t1).toBe(expected, values);
  });
});
