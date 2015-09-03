/* globals describe, it, expect, fail */
var Rx = require('../../dist/cjs/Rx');

var BehaviorSubject = Rx.BehaviorSubject;
var nextTick = Rx.Scheduler.nextTick;

describe('BehaviorSubject', function() {
  it('should extend Subject', function(done){
    var subject = new BehaviorSubject(null);
    expect(subject instanceof Rx.Subject).toBe(true);
    done();
  });

  it('should start with an initialization value', function(done) {
    var subject = new BehaviorSubject('foo');
    var expected = ['foo', 'bar'];
    var i = 0;

    subject.subscribe(function(x) {
      expect(x).toBe(expected[i++]);
    }, null,
    function(){
      done();
    });

    // HACK
    Rx.Scheduler.nextTick.schedule(0, null, function(){
      subject.next('bar');
      subject.complete();
    });
  });

  it('should not replay last value after it completes', function(done) {
    var subject = new BehaviorSubject('foo');
    subject.next('bar');
    subject.next('baz');
    subject.complete();
    subject.subscribe(function(x) {
      fail('subscribeOnNext has been called');
    }, null, done);
  });
});