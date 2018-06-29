import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { EMPTY, of, EmptyError } from 'rxjs';
import { throwIfEmpty } from 'rxjs/operators';

declare function asDiagram(arg: string): Function;

/** @test {timeout} */
describe('throwIfEmpty', () => {
  describe('with errorFactory', () => {
    asDiagram('throwIfEmpty')('should error when empty', () => {
      const source = cold('----|');
      const expected =    '----#';
      expectObservable(
        source.pipe(throwIfEmpty(() => new Error('test')))
      ).toBe(expected, undefined, new Error('test'));
    });

    it('should throw if empty', () => {
      const error = new Error('So empty inside');
      let thrown: any;

      EMPTY.pipe(
        throwIfEmpty(() => error),
      )
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      expect(thrown).to.equal(error);
    });

    it('should NOT throw if NOT empty', () => {
      const error = new Error('So empty inside');
      let thrown: any;

      of('test').pipe(
        throwIfEmpty(() => error),
      )
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      expect(thrown).to.be.undefined;
    });

    it('should pass values through', () => {
      const source = cold('----a---b---c---|');
      const sub1 =        '^               !';
      const expected =    '----a---b---c---|';
      expectObservable(
        source.pipe(throwIfEmpty(() => new Error('test')))
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should never when never', () => {
      const source = cold('-');
      const sub1 =        '^';
      const expected =    '-';
      expectObservable(
        source.pipe(throwIfEmpty(() => new Error('test')))
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should error when empty', () => {
      const source = cold('----|');
      const sub1 =        '^   !';
      const expected =    '----#';
      expectObservable(
        source.pipe(throwIfEmpty(() => new Error('test')))
      ).toBe(expected, undefined, new Error('test'));
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });

  describe('without errorFactory', () => {
    it('should throw EmptyError if empty', () => {
      let thrown: any;

      EMPTY.pipe(
        throwIfEmpty(),
      )
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      expect(thrown).to.be.instanceof(EmptyError);
    });

    it('should NOT throw if NOT empty', () => {
      let thrown: any;

      of('test').pipe(
        throwIfEmpty(),
      )
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      expect(thrown).to.be.undefined;
    });

    it('should pass values through', () => {
      const source = cold('----a---b---c---|');
      const sub1 =        '^               !';
      const expected =    '----a---b---c---|';
      expectObservable(
        source.pipe(throwIfEmpty())
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should never when never', () => {
      const source = cold('-');
      const sub1 =        '^';
      const expected =    '-';
      expectObservable(
        source.pipe(throwIfEmpty())
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should error when empty', () => {
      const source = cold('----|');
      const sub1 =        '^   !';
      const expected =    '----#';
      expectObservable(
        source.pipe(throwIfEmpty())
      ).toBe(expected, undefined, new EmptyError());
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
});
