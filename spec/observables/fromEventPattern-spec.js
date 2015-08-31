/* globals describe, it, expect, jasmine */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.fromEventPattern', function(){
  it('should call addHandler on subscription', function () {
    var addHandlerCalledWith;
    var addHandler = function (h) {
      addHandlerCalledWith = h;
    };
    
    var removeHandler = function () { };
    
    Observable.fromEventPattern(addHandler, removeHandler)
      .subscribe(function () { });
    
    expect(typeof addHandlerCalledWith).toBe('function');
  });
  
  it('should call removeHandler on unsubscription', function () {
    var removeHandlerCalledWith;
    var addHandler = function () { };
    var removeHandler = function (h) {
      removeHandlerCalledWith = h;  
    };
    
    var subscription = Observable.fromEventPattern(addHandler, removeHandler)
      .subscribe(function () { });
    
    subscription.unsubscribe();
    
    expect(typeof removeHandlerCalledWith).toBe('function');
  });
  
  it('should send errors in addHandler down the error path', function () {
    Observable.fromEventPattern(function (handler) {
      throw 'bad';
    }, function () { })
      .subscribe(function () { },
        function (err) {
          expect(err).toBe('bad');
        });
  });
  
  it('should accept a selector that maps outgoing values', function (done) {
    var target;
    var trigger = function () {
      if (target) {
        target.apply(null, arguments);
      }
    };
    
    var addHandler = function (handler) {
      target = handler;
    };
    var removeHandler = function (handler) {
      target = null;
    };
    var selector = function (a, b) {
      return a + b + '!';
    };
    
    Observable.fromEventPattern(addHandler, removeHandler, selector)
      .subscribe(function (x) {
        expect(x).toBe('testme!');
        done();
      });
    
    trigger('test', 'me');
  });
  
  it('should send errors in the selector down the error path', function (done) {
    var target;
    var trigger = function (value) {
      if (target) {
        target(value);
      }
    };
    
    var addHandler = function (handler) {
      target = handler;
    };
    var removeHandler = function (handler) {
      target = null;
    };
    var selector = function (x) {
      throw 'bad';
    };
    
    Observable.fromEventPattern(addHandler, removeHandler, selector)
      .subscribe(function () { },
      function (err) {
        expect(err).toBe('bad');
        done();
      });
    
    trigger('test');
  });
});