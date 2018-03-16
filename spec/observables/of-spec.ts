import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { empty } from 'rxjs';
import { expectObservable } from '../helpers/marble-testing';
declare const asDiagram: any;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {of} */
describe('Observable.of', () => {
  asDiagram('of(1, 2, 3)')('should create a cold observable that emits 1, 2, 3', () => {
    const e1 = Observable.of(1, 2, 3)
      // for the purpose of making a nice diagram, spread out the synchronous emissions
      .concatMap((x, i) => Observable.of(x).delay(i === 0 ? 0 : 20, rxTestScheduler));
    const expected = 'x-y-(z|)';
    expectObservable(e1).toBe(expected, {x: 1, y: 2, z: 3});
  });

  it('should create an observable from the provided values', (done: MochaDone) => {
    const x = { foo: 'bar' };
    const expected = [1, 'a', x];
    let i = 0;

    Observable.of<any>(1, 'a', x)
      .subscribe((y: any) => {
        expect(y).to.equal(expected[i++]);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should return an empty observable if passed no values', () => {
    const obs = Observable.of();
    expect(obs).to.equal(empty());
  });

  it('should emit one value', (done: MochaDone) => {
    let calls = 0;

    Observable.of(42).subscribe((x: number) => {
      expect(++calls).to.equal(1);
      expect(x).to.equal(42);
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should handle an Observable as the only value', () => {
    const source = Observable.of<Rx.Observable<string>>(
      Observable.of<string>('a', 'b', 'c', rxTestScheduler),
      rxTestScheduler
    );
    const result = source.concatAll();
    expectObservable(result).toBe('(abc|)');
  });

  it('should handle many Observable as the given values', () => {
    const source = Observable.of<Rx.Observable<string>>(
      Observable.of<string>('a', 'b', 'c', rxTestScheduler),
      Observable.of<string>('d', 'e', 'f', rxTestScheduler),
      rxTestScheduler
    );

    const result = source.concatAll();
    expectObservable(result).toBe('(abcdef|)');
  });
});
