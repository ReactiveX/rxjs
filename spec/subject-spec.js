/* globals describe, it, expect */
var RxNext = require('../dist/cjs/RxNext');

var Subject = RxNext.Subject;
var nextTick = RxNext.Scheduler.nextTick;

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
		
    // HACK
    RxNext.Scheduler.nextTick.schedule(0, null, function () {
      subject.next('foo');
      subject.next('bar');
      subject.complete();
    });
  });


  it('should pump values to multiple observers', function (done) {
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

  it('should clean out unsubscribed observers after a next', function (done) {
    var subject = new Subject();
    var expected1 = ['foo', 'bar'];
    var expected2 = ['foo', 'bar'];
    var i1 = 0;
    var i2 = 0;
    
    var sub1 = subject.subscribe(function (x) {
      expect(x).toBe(expected1[i1++]);
      sub1.unsubscribe();
    });
    
    subject.subscribe(function (x) {
      expect(x).toBe(expected2[i2++]);
    });
    
    nextTick.schedule(0, null, function () {
      expect(subject.observers.length).toBe(2);
      subject.next('foo');
      expect(subject.observers.length).toBe(1);
      subject.next('bar');
      done();
    });
  });
});