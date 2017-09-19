import { expect } from 'chai';
import * as Rx from '../dist/package/Rx';
import marbleTestingSignature = require('./helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { time };
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;

const Subject = Rx.Subject;
const Observable = Rx.Observable;

/** @test {Subject} */
describe('Subject', () => {
  it('should pump values right on through itself', (done: MochaDone) => {
    const subject = new Subject();
    const expected = ['foo', 'bar'];

    subject.subscribe((x: string) => {
      expect(x).to.equal(expected.shift());
    }, null, done);

    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should pump values to multiple subscribers', (done: MochaDone) => {
    const subject = new Subject();
    const expected = ['foo', 'bar'];

    let i = 0;
    let j = 0;

    subject.subscribe(function (x) {
      expect(x).to.equal(expected[i++]);
    });

    subject.subscribe(function (x) {
      expect(x).to.equal(expected[j++]);
    }, null, done);

    expect(subject.observers.length).to.equal(2);
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

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 8]);
    expect(results3).to.deep.equal([11]);
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

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 'C']);
    expect(results3).to.deep.equal(['C']);
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

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 'E']);
    expect(results3).to.deep.equal(['E']);
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

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal(['C']);
    expect(results3).to.deep.equal(['C']);
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
        function (err) {
          expect(false).to.equal('should not throw error: ' + err.toString());
        }
      );
    }).to.throw(Rx.ObjectUnsubscribedError);

    expect(results1).to.deep.equal([1, 2, 3, 4, 5]);
    expect(results2).to.deep.equal([3, 4, 5]);
    expect(results3).to.deep.equal([]);
  });

  it('should not allow values to be nexted after it is unsubscribed', (done: MochaDone) => {
    const subject = new Subject();
    const expected = ['foo'];

    subject.subscribe(function (x) {
      expect(x).to.equal(expected.shift());
    });

    subject.next('foo');
    subject.unsubscribe();
    expect(() => subject.next('bar')).to.throw(Rx.ObjectUnsubscribedError);
    done();
  });

  it('should clean out unsubscribed subscribers', (done: MochaDone) => {
    const subject = new Subject();

    const sub1 = subject.subscribe(function (x) {
      //noop
    });

    const sub2 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observers.length).to.equal(2);
    sub1.unsubscribe();
    expect(subject.observers.length).to.equal(1);
    sub2.unsubscribe();
    expect(subject.observers.length).to.equal(0);
    done();
  });

  it('should have a static create function that works', () => {
    expect(Subject.create).to.be.a('function');
    const source = Observable.of(1, 2, 3, 4, 5);
    const nexts = [];
    const output = [];

    let error: any;
    let complete = false;
    let outputComplete = false;

    const destination = {
      closed: false,
      next: function (x) {
        nexts.push(x);
      },
      error: function (err) {
        error = err;
        this.closed = true;
      },
      complete: () => {
        complete = true;
        this.closed = true;
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

    expect(nexts).to.deep.equal(['a', 'b', 'c']);
    expect(complete).to.be.true;
    expect(error).to.be.a('undefined');

    expect(output).to.deep.equal([1, 2, 3, 4, 5]);
    expect(outputComplete).to.be.true;
  });

  it('should have a static create function that works also to raise errors', () => {
    expect(Subject.create).to.be.a('function');
    const source = Observable.of(1, 2, 3, 4, 5);
    const nexts = [];
    const output = [];

    let error: any;
    let complete = false;
    let outputComplete = false;

    const destination = {
      closed: false,
      next: function (x) {
        nexts.push(x);
      },
      error: function (err) {
        error = err;
        this.closed = true;
      },
      complete: () => {
        complete = true;
        this.closed = true;
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

    expect(nexts).to.deep.equal(['a', 'b', 'c']);
    expect(complete).to.be.false;
    expect(error).to.equal('boom');

    expect(output).to.deep.equal([1, 2, 3, 4, 5]);
    expect(outputComplete).to.be.true;
  });

  it('should be an Observer which can be given to Observable.subscribe', (done: MochaDone) => {
    const source = Observable.of(1, 2, 3, 4, 5);
    const subject = new Subject();
    const expected = [1, 2, 3, 4, 5];

    subject.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    source.subscribe(subject);
  });

  it('should be usable as an Observer of a finite delayed Observable', (done: MochaDone) => {
    const source = Rx.Observable.of(1, 2, 3).delay(50);
    const subject = new Rx.Subject();

    const expected = [1, 2, 3];

    subject.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    source.subscribe(subject);
  });

  it('should throw ObjectUnsubscribedError when emit after unsubscribed', () => {
    const subject = new Rx.Subject();
    subject.unsubscribe();

    expect(() => {
      subject.next('a');
    }).to.throw(Rx.ObjectUnsubscribedError);

    expect(() => {
      subject.error('a');
    }).to.throw(Rx.ObjectUnsubscribedError);

    expect(() => {
      subject.complete();
    }).to.throw(Rx.ObjectUnsubscribedError);
  });

  it('should not next after completed', () => {
    const subject = new Rx.Subject();
    const results = [];
    subject.subscribe(x => results.push(x), null, () => results.push('C'));
    subject.next('a');
    subject.complete();
    subject.next('b');
    expect(results).to.deep.equal(['a', 'C']);
  });

  it('should not next after error', () => {
    const error = new Error('wut?');
    const subject = new Rx.Subject();
    const results = [];
    subject.subscribe(x => results.push(x), (err) => results.push(err));
    subject.next('a');
    subject.error(error);
    subject.next('b');
    expect(results).to.deep.equal(['a', error]);
  });

  describe('asObservable', () => {
    it('should hide subject', () => {
      const subject = new Rx.Subject();
      const observable = subject.asObservable();

      expect(subject).not.to.equal(observable);

      expect(observable instanceof Observable).to.be.true;
      expect(observable instanceof Subject).to.be.false;
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

    it('should work with inherited subject', () => {
      const results = [];
      const subject = new Rx.AsyncSubject();

      subject.next(42);
      subject.complete();

      const observable = subject.asObservable();

      observable.subscribe(x => results.push(x), null, () => results.push('done'));

      expect(results).to.deep.equal([42, 'done']);
    });
  });
});

describe('AnonymousSubject', () => {
  it('should be exposed', () => {
    expect(Rx.AnonymousSubject).to.be.a('function');
  });

  it('should not eager', () => {
    let subscribed = false;

    const subject = Rx.Subject.create(null, new Rx.Observable((observer: Rx.Observer<any>) => {
      subscribed = true;
      const subscription = Rx.Observable.of('x').subscribe(observer);
      return () => {
        subscription.unsubscribe();
      };
    }));

    const observable = subject.asObservable();
    expect(subscribed).to.be.false;

    observable.subscribe();
    expect(subscribed).to.be.true;
  });
});
