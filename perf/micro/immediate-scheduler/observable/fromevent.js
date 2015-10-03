var RxOld = require('rx');
var RxNew = require('../../../../index');
var Event = require('events');

module.exports = function fromEvent(suite) {
  var eventName = 'testEvent';

  var oldRxEventEmitter = new Event.EventEmitter();
  var newRxEventEmitter = new Event.EventEmitter();

  var oldFromEventWithImmediateScheduler = RxOld.Observable.fromEvent(oldRxEventEmitter, eventName).take(1);
  var newFromEventWithImmediateScheduler = RxNew.Observable.fromEvent(newRxEventEmitter, eventName).take(1);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }

  return suite
    .add('old fromEvent with immediate scheduler', function () {
      oldFromEventWithImmediateScheduler.subscribe(_next, _error, _complete);
      oldRxEventEmitter.emit(eventName);
    })
    .add('new fromEvent with immediate scheduler', function () {
      newFromEventWithImmediateScheduler.subscribe(_next, _error, _complete);
      newRxEventEmitter.emit(eventName);
    });
};