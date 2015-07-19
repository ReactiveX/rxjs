/* globals describe, it, expect */
var RxNext = require('../dist/cjs/RxNext');

var BehaviorSubject = RxNext.BehaviorSubject;
var nextTick = RxNext.Scheduler.nextTick;

describe('BehaviorSubject', function() {
  it('should extend Subject', function(){
    var subject = new BehaviorSubject(null);
    expect(subject instanceof RxNext.Subject).toBe(true);
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
    RxNext.Scheduler.nextTick.schedule(0, null, function(){
      subject.next('bar');
      subject.complete();
    });
  });
});