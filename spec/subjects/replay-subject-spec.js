/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');

var ReplaySubject = Rx.ReplaySubject;
var nextTick = Rx.Scheduler.nextTick;

describe('ReplaySubject', function () {
  it('should extend Subject', function (done) {
    var subject = new ReplaySubject();
    expect(subject instanceof Rx.Subject).toBe(true);
    done();
  });

  it('should replay values upon subscription', function (done) {
    var subject = new ReplaySubject();
    var expects = [1, 2, 3];
    var i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe(function (x) {
      expect(x).toBe(expects[i++]);
      if (i === 3) {
        done();
      }
    });
  });

  it('should replay values and complete', function (done) {
    var subject = new ReplaySubject();
    var expects = [1, 2, 3];
    var i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();
    subject.subscribe(function (x) {
      expect(x).toBe(expects[i++]);
    }, null, done);
  });

  it('should replay values and error', function (done) {
    var subject = new ReplaySubject();
    var expects = [1, 2, 3];
    var i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.error('fooey');
    subject.subscribe(function (x) {
      expect(x).toBe(expects[i++]);
    }, function (err) {
      expect(err).toBe('fooey');
      done();
    });
  });

  it('should only replay values within its buffer size', function (done) {
    var subject = new ReplaySubject(2);
    var expects = [2, 3];
    var i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe(function (x) {
      expect(x).toBe(expects[i++]);
      if (i === 2) {
        done();
      }
    });
  });
});