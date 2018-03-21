import { expect } from 'chai';
import { cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import * as Rx from '../../dist/package/Rx';

/** @test {timeout} */
describe('throwIfEmpty', () => {
  describe('with errorFactory', () => {
    it('should throw if empty', () => {
      const error = new Error('So empty inside');
      let thrown: any;

      Rx.Observable.empty().throwIfEmpty(() => error)
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

      Rx.Observable.of('test').throwIfEmpty(() => error)
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      // tslint:disable-next-line:no-unused-expression
      expect(thrown).to.be.undefined;
    });

    it('should pass values through', () => {
      const source = cold('----a---b---c---|');
      const sub1 =        '^               !';
      const expected =    '----a---b---c---|';
      expectObservable(
        source.throwIfEmpty(() => new Error('test'))
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should never when never', () => {
      const source = cold('-');
      const sub1 =        '^';
      const expected =    '-';
      expectObservable(
        source.throwIfEmpty(() => new Error('test'))
      ).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should error when empty', () => {
      const source = cold('----|');
      const sub1 =        '^   !';
      const expected =    '----#';
      expectObservable(
        source.throwIfEmpty(() => new Error('test'))
      ).toBe(expected, undefined, new Error('test'));
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });

  describe('without errorFactory', () => {
    it('should throw EmptyError if empty', () => {
      let thrown: any;

      Rx.Observable.empty().throwIfEmpty()
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      expect(thrown).to.be.instanceof(Rx.EmptyError);
    });

    it('should NOT throw if NOT empty', () => {
      let thrown: any;

      Rx.Observable.of('test').throwIfEmpty()
      .subscribe({
        error(err) {
          thrown = err;
        }
      });

      // tslint:disable-next-line:no-unused-expression
      expect(thrown).to.be.undefined;
    });

    it('should pass values through', () => {
      const source = cold('----a---b---c---|');
      const sub1 =        '^               !';
      const expected =    '----a---b---c---|';
      expectObservable(source.throwIfEmpty()).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should never when never', () => {
      const source = cold('-');
      const sub1 =        '^';
      const expected =    '-';
      expectObservable(source.throwIfEmpty()).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });

    it('should error when empty', () => {
      const source = cold('----|');
      const sub1 =        '^   !';
      const expected =    '----#';
      expectObservable(
        source.throwIfEmpty()
      ).toBe(expected, undefined, new Rx.EmptyError());
      expectSubscriptions(source.subscriptions).toBe([sub1]);
    });
  });
});
