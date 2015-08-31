/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Subject = Rx.Subject;
var nextTick = Rx.Scheduler.nextTick;

describe('Subject', function () {
  it('should pump values right on through itself', function (done) {
    var subject = new Subject();
    var expected = ['foo', 'bar'];
    var i = 0;

    subject.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null,
      function () {
        done();
      });
    
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
    }, null,
      function () {
        done();
      });
    
    // HACK
    nextTick.schedule(0, null, function () {
      expect(subject.observers.length).toBe(2);
      subject.next('foo');
      subject.next('bar');
      subject.complete();
    });
  });

  it('should not allow values to be nexted after a return', function (done) {
    var subject = new Subject();
    var expected = ['foo'];
    var i = 0;

    subject.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null,
      function () {
        //HACK
        nextTick.schedule(0, null, done);
      });
    
    // HACK
    nextTick.schedule(0, null, function () {
      subject.next('foo');
      subject.complete();
      subject.next('bar');
    });
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
});