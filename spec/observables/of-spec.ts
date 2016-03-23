import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {ArrayObservable} from '../../dist/cjs/observable/ArrayObservable';
import {ScalarObservable} from '../../dist/cjs/observable/ScalarObservable';
import {EmptyObservable} from '../../dist/cjs/observable/EmptyObservable';
declare const {expectObservable};
import {DoneSignature} from '../helpers/test-helper';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {of} */
describe('Observable.of', () => {
  it('should create an observable from the provided values', (done: DoneSignature) => {
    const x = { foo: 'bar' };
    const expected = [1, 'a', x];
    let i = 0;

    Observable.of<any>(1, 'a', x)
      .subscribe((y: any) => {
        expect(y).toBe(expected[i++]);
      }, (x) => {
        done.fail('should not be called');
      }, () => {
        done();
      });
  });

  it('should return a scalar observable if only passed one value', () => {
    const obs = Observable.of('one');
    expect(obs instanceof ScalarObservable).toBe(true);
  });

  it('should return a scalar observable if only passed one value and a scheduler', () => {
    const obs = Observable.of<string>('one', Rx.Scheduler.queue);
    expect(obs instanceof ScalarObservable).toBe(true);
  });

  it('should return an array observable if passed many values', () => {
    const obs = Observable.of('one', 'two', 'three');
    expect(obs instanceof ArrayObservable).toBe(true);
  });

  it('should return an empty observable if passed no values', () => {
    const obs = Observable.of();
    expect(obs instanceof EmptyObservable).toBe(true);
  });

  it('should return an empty observable if passed only a scheduler', () => {
    const obs = Observable.of(Rx.Scheduler.queue);
    expect(obs instanceof EmptyObservable).toBe(true);
  });

  it('should emit one value', (done: DoneSignature) => {
    let calls = 0;

    Observable.of(42).subscribe((x: number) => {
      expect(++calls).toBe(1);
      expect(x).toBe(42);
    }, (err: any) => {
      done.fail('should not be called');
    }, () => {
      done();
    });
  });

  it('should handle an Observable as the only value', () => {
    const source = Observable.of<Rx.Observable<string>>(
      Observable.of<string>('a', 'b', 'c', rxTestScheduler),
      rxTestScheduler
    );
    expect(source instanceof ScalarObservable).toBe(true);
    const result = source.concatAll();
    expectObservable(result).toBe('(abc|)');
  });

  it('should handle many Observable as the given values', () => {
    const source = Observable.of<Rx.Observable<string>>(
      Observable.of<string>('a', 'b', 'c', rxTestScheduler),
      Observable.of<string>('d', 'e', 'f', rxTestScheduler),
      rxTestScheduler
    );
    expect(source instanceof ArrayObservable).toBe(true);

    const result = source.concatAll();
    expectObservable(result).toBe('(abcdef|)');
  });
});