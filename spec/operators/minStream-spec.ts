import { minStream } from 'rxjs/operators';
import { hot, expectObservable } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {minStream} */
describe('minStream operator', () => {
  asDiagram('minStream')('should stream with min values on each iteration', () => {
    const source = hot('--2--3--1--2--|');
    const expected = '--2--2--1--1--|)';

    expectObservable(source.pipe(minStream())).toBe(expected);
  });

  it('should stream with min values on each iteration with comparator', () => {
    const e1 = hot('--a--b--c--d--|', {
      a: { name: 'aa' },
      b: { name: 'aaa' },
      c: { name: 'a' },
      d: { name: 'aa' },
    });
    const expected = '--a--b--c--d--|';
    const comparator = (x: any, y: any) => x.name.length > y.name.length;

    expectObservable(e1.pipe(minStream(comparator))).toBe(expected, {
      a: { name: 'aa' },
      b: { name: 'aa' },
      c: { name: 'a' },
      d: { name: 'a' },
    });
  });
});
