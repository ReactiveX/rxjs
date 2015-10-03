var RxOld = require('rx');
var RxNew = require('../../../../index');
var Event = require('events');

module.exports = function fromEventPattern(suite) {
  var eventName = 'testEvent';

  var oldRxEventEmitter = new Event.EventEmitter();
  var newRxEventEmitter = new Event.EventEmitter();

  var oldFromEventPatternWithImmediateScheduler = RxOld.Observable.fromEventPattern(
    function add(h) {
      oldRxEventEmitter.addListener(eventName, h);
    },
    function remove(h) {
      oldRxEventEmitter.removeListener(eventName, h);
    }).take(1);

  var newFromEventPatternWithImmediateScheduler = RxNew.Observable.fromEventPattern(
    function add(h) {
      newRxEventEmitter.addListener(eventName, h);
    },
    function remove(h) {
      newRxEventEmitter.removeListener(eventName, h);
    }).take(1);

  function _next(x) { }
  function _error(e) { }
  function _complete() { }

  return suite
    .add('old fromEventPattern with immediate scheduler', function () {
      oldFromEventPatternWithImmediateScheduler.subscribe(_next, _error, _complete);
      oldRxEventEmitter.emit(eventName);
    })
    .add('new fromEventPattern with immediate scheduler', function () {
      newFromEventPatternWithImmediateScheduler.subscribe(_next, _error, _complete);
      newRxEventEmitter.emit(eventName);
    });
};