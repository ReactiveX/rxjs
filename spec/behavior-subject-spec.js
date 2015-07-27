/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var BehaviorSubject = Rx.BehaviorSubject;
var nextTick = Rx.Scheduler.nextTick;

describe('BehaviorSubject', function() {
  it('should extend Subject', function(){
    var subject = new BehaviorSubject(null);
    expect(subject instanceof Rx.Subject).toBe(true);
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
});