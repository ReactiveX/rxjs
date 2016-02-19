import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {IteratorObservable} from '../../dist/cjs/observable/IteratorObservable';
import {expectObservable} from '../helpers/marble-testing';
import {it, DoneSignature} from '../helpers/test-helper';

declare const rxTestScheduler: Rx.TestScheduler;

describe('IteratorObservable', () => {
  it('should create an Observable via constructor', () => {
    const source = new IteratorObservable([]);
    expect(source instanceof IteratorObservable).toBe(true);
  });

  it('should create IteratorObservable via static create function', () => {
    const s = new IteratorObservable([]);
    const r = IteratorObservable.create([]);
    expect(s).toEqual(r);
  });

  it('should not accept null (or truthy-equivalent to null) iterator', () => {
    expect(() => {
      IteratorObservable.create(null);
    }).toThrowError('iterator cannot be null.');
    expect(() => {
      IteratorObservable.create(void 0);
    }).toThrowError('iterator cannot be null.');
  });

  it('should not accept boolean as iterator', () => {
    expect(() => {
      IteratorObservable.create(false);
    }).toThrowError('Object is not iterable');
  });

  it('should not accept non-function project', () => {
    expect(() => {
      IteratorObservable.create([], 42);
    }).toThrowError('When provided, `project` must be a function.');
  });

  it('should emit members of an array iterator', (done: DoneSignature) => {
    const expected = [10, 20, 30, 40];
    IteratorObservable.create([10, 20, 30, 40])
      .subscribe(
        (x: number) => { expect(x).toBe(expected.shift()); },
        done.fail,
        () => {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should emit members of an array iterator on a particular scheduler', () => {
    const source = IteratorObservable.create(
      [10, 20, 30, 40],
      (x: number) => x,
      null,
      rxTestScheduler
    );

    const values = { a: 10, b: 20, c: 30, d: 40 };

    expectObservable(source).toBe('(abcd|)', values);
  });

  it('should emit members of an array iterator on a particular scheduler, project throws', () => {
    const source = IteratorObservable.create(
      [10, 20, 30, 40],
      (x: number) => {
        if (x === 30) {
          throw 'error';
        }
        return x * x;
      },
      null,
      rxTestScheduler
    );

    const values = { a: 100, b: 400 };

    expectObservable(source).toBe('(ab#)', values);
  });

  it('should emit members of an array iterator on a particular scheduler, ' +
  'but is unsubscribed early', (done: DoneSignature) => {
    const expected = [10, 20, 30, 40];

    const source = IteratorObservable.create(
      [10, 20, 30, 40],
      (x: number) => x,
      null,
      Rx.Scheduler.queue
    );

    const subscriber = Rx.Subscriber.create(
      (x: number) => {
        expect(x).toBe(expected.shift());
        if (x === 30) {
          subscriber.unsubscribe();
          done();
        }
      },
      done.fail,
      done.fail
    );

    source.subscribe(subscriber);
  });

  it('should emit members of an array iterator, and project them', (done: DoneSignature) => {
    const expected = [100, 400, 900, 1600];
    IteratorObservable.create([10, 20, 30, 40], (x: number) => x * x)
      .subscribe(
        (x: number) => { expect(x).toBe(expected.shift()); },
        done.fail,
        () => {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should emit members of an array iterator, and project but raise an error', (done: DoneSignature) => {
    const expected = [100, 400];
    function project(x) {
      if (x === 30) {
        throw new Error('boom');
      } else {
        return x * x;
      }
    }
    IteratorObservable.create([10, 20, 30, 40], project)
      .subscribe(
        (x: number) => {
          expect(x).toBe(expected.shift());
        },
        (err: any) => {
          expect(expected.length).toBe(0);
          expect(err.message).toBe('boom');
          done();
        },
        done.fail
      );
  });

  it('should emit characters of a string iterator', (done: DoneSignature) => {
    const expected = ['f', 'o', 'o'];
    IteratorObservable.create('foo')
      .subscribe(
        (x: number) => { expect(x).toBe(expected.shift()); },
        done.fail,
        () => {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should emit characters of a string iterator, and project them', (done: DoneSignature) => {
    const expected = ['F', 'O', 'O'];
    IteratorObservable.create('foo', (x: string) => x.toUpperCase())
      .subscribe(
        (x: string) => { expect(x).toBe(expected.shift()); },
        done.fail,
        () => {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should be possible to unsubscribe in the middle of the iteration', (done: DoneSignature) => {
    const expected = [10, 20, 30];

    const subscriber = Rx.Subscriber.create(
      (x: number) => {
        expect(x).toBe(expected.shift());
        if (x === 30) {
          subscriber.unsubscribe();
          done();
        }
      },
      done.fail,
      done.fail
    );

    IteratorObservable.create([10, 20, 30, 40, 50, 60]).subscribe(subscriber);
  });
});
