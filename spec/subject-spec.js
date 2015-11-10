/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Subject = Rx.Subject;
var nextTick = Rx.Scheduler.nextTick;
var Observable = Rx.Observable;

describe('Subject', function () {
  it('should pump values right on through itself', function (done) {
    var subject = new Subject();
    var expected = ['foo', 'bar'];

    subject.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);

    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should pump values to multiple subscribers', function (done) {
    var subject = new Subject();
    var expected = ['foo', 'bar'];
    var i = 0;
    var j = 0;

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
  'subject does not complete', function () {
    var subject = new Subject();
    var results1 = [];
    var results2 = [];
    var results3 = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    var subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      function () { results1.push('C'); }
    );

    subject.next(5);

    var subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      function () { results2.push('C'); }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.next(8);

    subscription2.unsubscribe();

    subject.next(9);
    subject.next(10);

    var subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      function () { results3.push('C'); }
    );

    subject.next(11);

    subscription3.unsubscribe();

    expect(results1).toEqual([5,6,7]);
    expect(results2).toEqual([6,7,8]);
    expect(results3).toEqual([11]);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject completes', function () {
    var subject = new Subject();
    var results1 = [];
    var results2 = [];
    var results3 = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    var subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      function () { results1.push('C'); }
    );

    subject.next(5);

    var subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      function () { results2.push('C'); }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.complete();
    subject.next(9);
    subject.complete();
    subject.error(new Error('err'));

    subscription2.unsubscribe();

    var subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      function () { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([5,6,7]);
    expect(results2).toEqual([6,7,'C']);
    expect(results3).toEqual(['C']);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject terminates with an error', function () {
    var subject = new Subject();
    var results1 = [];
    var results2 = [];
    var results3 = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    var subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      function () { results1.push('C'); }
    );

    subject.next(5);

    var subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      function () { results2.push('C'); }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.error(new Error('err'));
    subject.next(9);
    subject.complete();
    subject.error(new Error('err'));

    subscription2.unsubscribe();

    var subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      function () { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([5,6,7]);
    expect(results2).toEqual([6,7,'E']);
    expect(results3).toEqual(['E']);
  });

  it('should handle subscribers that arrive and leave at different times, ' +
  'subject completes before nexting any value', function () {
    var subject = new Subject();
    var results1 = [];
    var results2 = [];
    var results3 = [];

    var subscription1 = subject.subscribe(
      function (x) { results1.push(x); },
      function (e) { results1.push('E'); },
      function () { results1.push('C'); }
    );

    var subscription2 = subject.subscribe(
      function (x) { results2.push(x); },
      function (e) { results2.push('E'); },
      function () { results2.push('C'); }
    );

    subscription1.unsubscribe();

    subject.complete();
    subject.next(9);
    subject.complete();
    subject.error(new Error('err'));

    subscription2.unsubscribe();

    var subscription3 = subject.subscribe(
      function (x) { results3.push(x); },
      function (e) { results3.push('E'); },
      function () { results3.push('C'); }
    );

    subscription3.unsubscribe();

    expect(results1).toEqual([]);
    expect(results2).toEqual(['C']);
    expect(results3).toEqual(['C']);
  });

  it('should not allow values to be nexted after a return', function (done) {
    var subject = new Subject();
    var expected = ['foo'];

    subject.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);

    subject.next('foo');
    subject.complete();
    subject.next('bar');
  });

  it('should clean out unsubscribed subscribers', function (done) {
    var subject = new Subject();

    var sub1 = subject.subscribe(function (x) {
    });

    var sub2 = subject.subscribe(function (x) {
    });

    expect(subject.observers.length).toBe(2);
    sub1.unsubscribe();
    expect(subject.observers.length).toBe(1);
    sub2.unsubscribe();
    expect(subject.observers.length).toBe(0);
    done();
  });

  it('should have a static create function that works', function () {
    expect(typeof Subject.create).toBe('function');
    var source = Observable.of(1,2,3,4,5);
    var nexts = [];
    var error;
    var complete = false;
    var output = [];
    var outputComplete = false;

    var destination = {
      isUnsubscribed: false,
      next: function (x) {
        nexts.push(x);
      },
      error: function (err) {
        error = err;
        this.isUnsubscribed = true;
      },
      complete: function () {
        complete = true;
        this.isUnsubscribed = true;
      }
    };

    var sub = Subject.create(source, destination);

    sub.subscribe(function (x) {
      output.push(x);
    }, null, function () {
      outputComplete = true;
    });

    sub.next('a');
    sub.next('b');
    sub.next('c');
    sub.complete();

    expect(nexts).toEqual(['a','b','c']);
    expect(complete).toBe(true);
    expect(error).toBe(undefined);

    expect(output).toEqual([1,2,3,4,5]);
    expect(outputComplete).toBe(true);
  });
});