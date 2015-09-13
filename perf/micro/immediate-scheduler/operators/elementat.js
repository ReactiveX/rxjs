var RxOld = require("rx");
var RxNew = require("../../../../index");

module.exports = function (suite) {

  var oldElementAtWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).elementAt(5);
  var newElementAtWithImmediateScheduler = RxNew.Observable.range(0, 25).elementAt(5);

  return suite
    .add('old elementAt with immediate scheduler', function () {
      oldElementAtWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new elementAt with immediate scheduler', function () {
      newElementAtWithImmediateScheduler.subscribe(_next, _error, _complete);
    });

  function _next(x) { }
  function _error(e){ }
  function _complete(){ }
};