var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function (suite) {
  var oldPairwiseWithImmediateScheduler = RxOld.Observable.range(0, 25, RxOld.Scheduler.immediate).pairwise();
  var newPairwiseWithImmediateScheduler = RxNew.Observable.range(0, 25).pairwise();

  function _next(x) { }
  function _error(e) { }
  function _complete() { }
  return suite
    .add('old pairwise with immediate scheduler', function () {
      oldPairwiseWithImmediateScheduler.subscribe(_next, _error, _complete);
    })
    .add('new pairwise with immediate scheduler', function () {
      newPairwiseWithImmediateScheduler.subscribe(_next, _error, _complete);
    });
};
