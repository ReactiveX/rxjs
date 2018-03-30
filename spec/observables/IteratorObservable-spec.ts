import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { queue } from 'rxjs/scheduler/queue';
import { fromIterable } from 'rxjs/observable/fromIterable';

declare const expectObservable: any;
declare const rxTestScheduler: Rx.TestScheduler;

describe('fromIterable', () => {
  it('should not accept null (or truthy-equivalent to null) iterator', () => {
    expect(() => {
      fromIterable(null, undefined);
    }).to.throw(Error, 'Iterable cannot be null');
    expect(() => {
      fromIterable(void 0, undefined);
    }).to.throw(Error, 'Iterable cannot be null');
  });

  it('should emit members of an array iterator', (done) => {
    const expected = [10, 20, 30, 40];
    fromIterable([10, 20, 30, 40], undefined)
      .subscribe(
        (x) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          expect(expected.length).to.equal(0);
          done();
        }
      );
  });

  it('should get new iterator for each subscription', () => {
    const expected = [
      Rx.Notification.createNext(10),
      Rx.Notification.createNext(20),
      Rx.Notification.createComplete()
    ];

    const e1 = fromIterable<number>(new Int32Array([10, 20]), undefined).observeOn(rxTestScheduler);

    let v1, v2: Array<Rx.Notification<any>>;
    e1.materialize().toArray().subscribe((x) => v1 = x);
    e1.materialize().toArray().subscribe((x) => v2 = x);

    rxTestScheduler.flush();
    expect(v1).to.deep.equal(expected);
    expect(v2).to.deep.equal(expected);
  });

  it('should finalize generators if the subscription ends', () => {
    const iterator = {
      finalized: false,
      next() {
        return { value: 'duck', done: false };
      },
      return() {
        this.finalized = true;
      }
    };

    const iterable = {
      [Rx.Symbol.iterator]() {
        return iterator;
      }
    };

    const results: any[] = [];

    fromIterable(iterable as any, undefined)
      .take(3)
      .subscribe(
        x => results.push(x),
        null,
        () => results.push('GOOSE!')
      );

    expect(results).to.deep.equal(['duck', 'duck', 'duck', 'GOOSE!']);
    expect(iterator.finalized).to.be.true;
  });

  it('should finalize generators if the subscription and it is scheduled', () => {
    const iterator = {
      finalized: false,
      next() {
        return { value: 'duck', done: false };
      },
      return() {
        this.finalized = true;
      }
    };

    const iterable = {
      [Rx.Symbol.iterator]() {
        return iterator;
      }
    };

    const results: any[] = [];

    fromIterable(iterable as any, queue)
      .take(3)
      .subscribe(
        x => results.push(x),
        null,
        () => results.push('GOOSE!')
      );

    expect(results).to.deep.equal(['duck', 'duck', 'duck', 'GOOSE!']);
    expect(iterator.finalized).to.be.true;
  });

  it('should emit members of an array iterator on a particular scheduler', () => {
    const source = fromIterable(
      [10, 20, 30, 40],
      rxTestScheduler
    );

    const values = { a: 10, b: 20, c: 30, d: 40 };

    expectObservable(source).toBe('(abcd|)', values);
  });

  it('should emit members of an array iterator on a particular scheduler, ' +
  'but is unsubscribed early', (done) => {
    const expected = [10, 20, 30, 40];

    const source = fromIterable(
      [10, 20, 30, 40],
      Rx.Scheduler.queue
    );

    const subscriber = Rx.Subscriber.create(
      (x) => {
        expect(x).to.equal(expected.shift());
        if (x === 30) {
          subscriber.unsubscribe();
          done();
        }
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done(new Error('should not be called'));
      });

    source.subscribe(subscriber);
  });

  it('should emit characters of a string iterator', (done) => {
    const expected = ['f', 'o', 'o'];
    fromIterable('foo', undefined)
      .subscribe(
        (x) => { expect(x).to.equal(expected.shift()); },
        (x) => {
          done(new Error('should not be called'));
        }, () => {
          expect(expected.length).to.equal(0);
          done();
        }
      );
  });

  it('should be possible to unsubscribe in the middle of the iteration', (done) => {
    const expected = [10, 20, 30];

    const subscriber = Rx.Subscriber.create(
      (x) => {
        expect(x).to.equal(expected.shift());
        if (x === 30) {
          subscriber.unsubscribe();
          done();
        }
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done(new Error('should not be called'));
      }
    );

    fromIterable([10, 20, 30, 40, 50, 60], undefined).subscribe(subscriber);
  });
});
