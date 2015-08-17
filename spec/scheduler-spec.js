/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Scheduler = Rx.Scheduler;

describe('Scheduler.immediate', function() {
  it('should schedule things recursively', function() {
    var call1 = false;
    var call2 = false;
    Scheduler.immediate.active = false;
    Scheduler.immediate.schedule(0, null, function(){
      call1 = true;
      Scheduler.immediate.schedule(0, null, function(){
        call2 = true;
      });
    });   
    expect(call1).toBe(true);
    expect(call2).toBe(true);
  });
  
  it('should schedule things in the future too', function (done) {
    var called = false;
    Scheduler.immediate.schedule(500, null, function () {
      called = true;
    });
    
    setTimeout(function () {
      expect(called).toBe(false);
    }, 400);
    
    setTimeout(function() {
      expect(called).toBe(true);
      done();
    }, 700);
  })
});