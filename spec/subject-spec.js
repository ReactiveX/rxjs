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

  it('should have a static create function that works', function() {
    expect(typeof Subject.create).toBe('function');
    var source = Observable.of(1,2,3,4,5);
    var nexts = [];
    var error;
    var complete = false;
    var output = [];
    var outputComplete = false;

    var destination = {
      isUnsubscribed: false,
      next: function(x) {
        nexts.push(x);
      },
      error: function(err) {
        error = err;
        this.isUnsubscribed = true;
      },
      complete: function() {
        complete = true;
        this.isUnsubscribed = true;
      }
    };

    var sub = Subject.create(source, destination);

    sub.subscribe(function(x) {
      output.push(x);
    }, null, function() {
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