import * as Rx from '../dist/cjs/Rx';
declare const {hot, expectObservable};
import {DoneSignature} from './helpers/test-helper';

const Subject = Rx.Subject;
const Observable = Rx.Observable;

/** @test {Subject} */
describe('Subject', () => {
  it('should pump values right on through itself', (done: DoneSignature) => {
    const subject = new Subject();
    const expected = ['foo', 'bar'];

    subject.subscribe((x: string) => {
      expect(x).toBe(expected.shift());
    }, null, done);

    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should have the rxSubscriber Symbol', () => {
    const subject = new Subject();
    expect(typeof subject[Rx.Symbol.rxSubscriber]).toBe('function');
  });

  it('should pump values to multiple subscribers', (done: DoneSignature) => {
    const subject = new Subject();
    const expected = ['foo', 'bar'];

    let i = 0;
    let j = 0;

    subject.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    });

    subject.subscribe(function (x) {
      expect(x).toBe(expected[j++]);
    }, null, done);

    expect(subject.observers.length).toBe(2);
    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject does not complete', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];
    const results3 = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject.next(5);

    const subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.next(8);

    subscription2.unsubscribe();

    subject.next(9);
    subject.next(10);

    const subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subject.next(11);

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 8]);
    expect(results3).toEqual([11]);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject completes', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];
    const results3 = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject.next(5);

    const subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.complete();

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 'C']);
    expect(results3).toEqual(['C']);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject terminates with an error', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];
    const results3 = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject.next(5);

    const subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.error(new Error('err'));

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([5, 6, 7]);
    expect(results2).toEqual([6, 7, 'E']);
    expect(results3).toEqual(['E']);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject completes before nexting any value', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];
    const results3 = [];

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    const subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subscription1.unsubscribe();

    subject.complete();

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      () => { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([]);
    expect(results2).toEqual(['C']);
    expect(results3).toEqual(['C']);
  });

  it('should disallow new subscriber once subject has been disposed', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];
    const results3 = [];

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );

    subject.next(1);
    subject.next(2);

    const subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject.next(3);
    subject.next(4);
    subject.next(5);

    subscription1.unsubscribe();
    subscription2.unsubscribe();
    subject.unsubscribe();

    expect(() => {
      subject.subscribe(
        function (x) { results3.push(x); },
        function (e) { results3.push('E'); },
        () => { results3.push('C'); }
      );
    }).toThrow();

    expect(results1).toEqual([1, 2, 3, 4, 5]);
    expect(results2).toEqual([3, 4, 5]);
    expect(results3).toEqual([]);
  });

  it('should allow ad-hoc subscription to be added to itself', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];

    const auxSubject = new Subject();

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );
    const subscription2 = auxSubject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject.add(subscription2);

    subject.next(1);
    subject.next(2);
    subject.next(3);
    auxSubject.next('a');
    auxSubject.next('b');

    subscription1.unsubscribe();
    subject.unsubscribe();

    auxSubject.next('c');
    auxSubject.next('d');

    expect(results1).toEqual([1, 2, 3]);
    expect(subscription2.isUnsubscribed).toBe(true);
    expect(results2).toEqual(['a', 'b']);
  });

  it('should allow ad-hoc subscription to be removed from itself', () => {
    const subject = new Subject();
    const results1 = [];
    const results2 = [];

    const auxSubject = new Subject();

    const subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      () => { results1.push('C'); }
    );
    const subscription2 = auxSubject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      () => { results2.push('C'); }
    );

    subject.add(subscription2);

    subject.next(1);
    subject.next(2);
    subject.next(3);
    auxSubject.next('a');
    auxSubject.next('b');

    subject.remove(subscription2);
    subscription1.unsubscribe();
    subject.unsubscribe();

    auxSubject.next('c');
    auxSubject.next('d');

    expect(results1).toEqual([1, 2, 3]);
    expect(subscription2.isUnsubscribed).toBe(false);
    expect(results2).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should not allow values to be nexted after a return', (done: DoneSignature) => {
    const subject = new Subject();
    const expected = ['foo'];

    subject.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    });

    subject.next('foo');
    subject.complete();
    expect(() => subject.next('bar')).toThrow(new Rx.ObjectUnsubscribedError());
    done();
  });

  it('should clean out unsubscribed subscribers', (done: DoneSignature) => {
    const subject = new Subject();

    const sub1 = subject.subscribe(function (x) {
      //noop
    });

    const sub2 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observers.length).toBe(2);
    sub1.unsubscribe();
    expect(subject.observers.length).toBe(1);
    sub2.unsubscribe();
    expect(subject.observers.length).toBe(0);
    done();
  });

  it('should have a static create function that works', () => {
    expect(typeof Subject.create).toBe('function');
    const source = Observable.of(1, 2, 3, 4, 5);
    const nexts = [];
    const output = [];

    let error: any;
    let complete = false;
    let outputComplete = false;

    const destination = {
      isUnsubscribed: false,
      next: function (x) {
        nexts.push(x);
      },
      error: function (err) {
        error = err;
        this.isUnsubscribed = true;
      },
      complete: () => {
        complete = true;
        this.isUnsubscribed = true;
      }
    };

    const sub = Subject.create(destination, source);

    sub.subscribe(function (x) {
      output.push(x);
    }, null, () => {
      outputComplete = true;
    });

    sub.next('a');
    sub.next('b');
    sub.next('c');
    sub.complete();

    expect(nexts).toEqual(['a', 'b', 'c']);
    expect(complete).toBe(true);
    expect(error).toBe(undefined);

    expect(output).toEqual([1, 2, 3, 4, 5]);
    expect(outputComplete).toBe(true);
  });

  it('should have a static create function that works also to raise errors', () => {
    expect(typeof Subject.create).toBe('function');
    const source = Observable.of(1, 2, 3, 4, 5);
    const nexts = [];
    const output = [];

    let error: any;
    let complete = false;
    let outputComplete = false;

    const destination = {
      isUnsubscribed: false,
      next: function (x) {
        nexts.push(x);
      },
      error: function (err) {
        error = err;
        this.isUnsubscribed = true;
      },
      complete: () => {
        complete = true;
        this.isUnsubscribed = true;
      }
    };

    const sub = Subject.create(destination, source);

    sub.subscribe(function (x) {
      output.push(x);
    }, null, () => {
      outputComplete = true;
    });

    sub.next('a');
    sub.next('b');
    sub.next('c');
    sub.error('boom');

    expect(nexts).toEqual(['a', 'b', 'c']);
    expect(complete).toBe(false);
    expect(error).toBe('boom');

    expect(output).toEqual([1, 2, 3, 4, 5]);
    expect(outputComplete).toBe(true);
  });

  it('should be an Observer which can be given to Observable.subscribe', (done: DoneSignature) => {
    const source = Observable.of(1, 2, 3, 4, 5);
    const subject = new Subject();
    const expected = [1, 2, 3, 4, 5];

    subject.subscribe(
      function (x) {
        expect(x).toBe(expected.shift());
      },
      done.fail,
      done
    );

    source.subscribe(subject);
  });

  it('should be usable as an Observer of a finite delayed Observable', (done: DoneSignature) => {
    const source = Rx.Observable.of(1, 2, 3).delay(50);
    const subject = new Rx.Subject();

    const expected = [1, 2, 3];

    subject.subscribe(
      function (x) {
        expect(x).toBe(expected.shift());
      },
      done.fail,
      done);

    source.subscribe(subject);
  });

  it('should throw ObjectUnsubscribedError when emit after unsubscribed', () => {
    const subject = new Rx.Subject();
    subject.unsubscribe();

    expect(() => {
      subject.next('a');
    }).toThrow(new Rx.ObjectUnsubscribedError());

    expect(() => {
      subject.error('a');
    }).toThrow(new Rx.ObjectUnsubscribedError());

    expect(() => {
      subject.complete();
    }).toThrow(new Rx.ObjectUnsubscribedError());
  });

  it('should throw ObjectUnsubscribedError when emit after completed', () => {
    const subject = new Rx.Subject();
    subject.complete();

    expect(() => {
      subject.next('a');
    }).toThrow(new Rx.ObjectUnsubscribedError());

    expect(() => {
      subject.error('a');
    }).toThrow(new Rx.ObjectUnsubscribedError());

    expect(() => {
      subject.complete();
    }).toThrow(new Rx.ObjectUnsubscribedError());
  });

  it('should throw ObjectUnsubscribedError when emit after error', () => {
    const subject = new Rx.Subject();
    subject.error('e');

    expect(() => {
      subject.next('a');
    }).toThrow(new Rx.ObjectUnsubscribedError());

    expect(() => {
      subject.error('a');
    }).toThrow(new Rx.ObjectUnsubscribedError());

    expect(() => {
      subject.complete();
    }).toThrow(new Rx.ObjectUnsubscribedError());
  });

  describe('asObservable', () => {
    it('should hide subject', () => {
      const subject = new Rx.Subject();
      const observable = subject.asObservable();

      expect(subject).not.toEqual(observable);

      expect(observable instanceof Observable).toBe(true);
      expect(observable instanceof Subject).toBe(false);
    });

    it('should handle subject never emits', () => {
      const observable = hot('-').asObservable();

      expectObservable(observable).toBe(<any>[]);
    });

    it('should handle subject completes without emits', () => {
      const observable = hot('--^--|').asObservable();
      const expected =         '---|';

      expectObservable(observable).toBe(expected);
    });

    it('should handle subject throws', () => {
      const observable = hot('--^--#').asObservable();
      const expected =         '---#';

      expectObservable(observable).toBe(expected);
    });

    it('should handle subject emits', () => {
      const observable = hot('--^--x--|').asObservable();
      const expected =         '---x--|';

      expectObservable(observable).toBe(expected);
    });

    it('should work with inherited subject', (done: DoneSignature) => {
      const subject = new Rx.AsyncSubject();

      subject.next(42);
      subject.complete();

      const observable = subject.asObservable();

      const expected = [new Rx.Notification('N', 42),
                      new Rx.Notification('C')];

      observable.materialize().subscribe((x: Rx.Notification<number>) => {
        expect(x).toEqual(expected.shift());
      }, (err: any) => {
        done.fail(err);
      }, () => {
        expect(expected).toEqual([]);
        done();
      });
    });

    it('should not eager', () => {
      let subscribed = false;

      const subject = new Rx.Subject(null, new Rx.Observable((observer: Rx.Observer<any>) => {
        subscribed = true;
        const subscription = Rx.Observable.of('x').subscribe(observer);
        return () => {
          subscription.unsubscribe();
        };
      }));

      const observable = subject.asObservable();
      expect(subscribed).toBe(false);

      observable.subscribe();
      expect(subscribed).toBe(true);
    });
  });
});
