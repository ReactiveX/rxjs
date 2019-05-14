import { map, filterByLatestFrom } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {filterByLatestFrom} */
describe('filterByLatestFrom operator', () => {
  function mapToIsOdd() {
    return map((x: number | string) => (+x) % 2 === 1);
  }

  function mapToIsPrime() {
    return map((i: number | string) => {
      if (+i <= 1) { return false; }
      const max = Math.floor(Math.sqrt(+i));
      for (let j = 2; j <= max; ++j) {
        if (+i % j === 0) { return false; }
      }
      return true;
    });
  }

  asDiagram('filterByLatestFrom')('should filter in if the latest value emitted by other observable is odd', () => {
    const source = cold('-a--b---c---d-e-|');
    const filter = cold('--1--2-3-4------|');
    const expected =    '----b---c-------|';

    const result = source.pipe(filterByLatestFrom(filter.pipe(mapToIsOdd())));

    expectObservable(result).toBe(expected);
  });

  it('should filter in if latest is prime', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--|');
    const filter = hot('-1--2--^-3-4-5-6--7-8--9---|');
    const subs =              '^                   !';
    const expected =          '---c---e----g-------|';

    expectObservable(source.pipe(filterByLatestFrom(filter.pipe(mapToIsPrime())))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });

  it('should filter with an always-true latest value', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^                  !';
    const expected =          '--3-4-5-6--7-8--9--|';

    expectObservable(source.pipe(filterByLatestFrom(of(true)))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter with an always-false latest value', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^                  !';
    const expected =          '-------------------|';

    expectObservable(source.pipe(filterByLatestFrom(of(false)))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in if the latest is prime, source unsubscribes early', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--|');
    const filter = hot('-1--2--^-3-4-5-6--7-8--9---|');
    const subs =              '^            !       ';
    const unsub =             '             !       ';
    const expected =          '---c---e----g-       ';

    expectObservable(source.pipe(filterByLatestFrom(filter.pipe(mapToIsPrime()))), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });

  it('should filter in if latest is prime, source throws', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--#');
    const filter = hot('-1--2--^-3-4-5-6--7-8--9---|');
    const subs =              '^                   !';
    const expected =          '---c---e----g-------#';

    expectObservable(source.pipe(filterByLatestFrom(filter.pipe(mapToIsPrime())))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });

  it('should filter in if latest is prime, but filter throws', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--|');
    const filter = hot('-1--2--^-3-4-5-#            ');
    const subs =              '^       !            ';
    const expected =          '---c---e#            ';

    expectObservable(source.pipe(filterByLatestFrom(filter.pipe(mapToIsPrime())))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });

  it('should filter in if latest is prime, source errors', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--#', undefined, new Error('boo-hoo'));
    const filter = hot('-1--2--^-3-4-5-6--7-8--9---|');
    const subs =              '^                   !';
    const expected =          '---c---e----g-------#';

    expectObservable(source.pipe(filterByLatestFrom(
      filter.pipe(mapToIsPrime())
    ))).toBe(expected, undefined, new Error('boo-hoo'));
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });

  it('should filter in if latest is prime, but filter errors', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--|');
    const filter = hot('-1--2--^-3-4-5-#            ', undefined, new Error('boo-hoo'));
    const subs =              '^       !            ';
    const expected =          '---c---e#            ';

    expectObservable(source.pipe(filterByLatestFrom(
      filter.pipe(mapToIsPrime())
    ))).toBe(expected, undefined, new Error('boo-hoo'));
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });

  it('should filter with empty', () => {
    const source = hot('-a--b--^--c-d-e-f--g-h--j--|');
    const filter = hot('-------^-------------------|');
    const subs =              '^                   !';
    const expected =          '--------------------|';

    expectObservable(source.pipe(filterByLatestFrom(
      filter.pipe(mapToIsPrime())
    ))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(filter.subscriptions).toBe(subs);
  });
});
