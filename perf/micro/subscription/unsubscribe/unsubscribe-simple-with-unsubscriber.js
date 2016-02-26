var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var OldDisposable = RxOld.Disposable;
  var NewSubscription = RxNew.Subscription;

  var oldI = 0;
  function oldDisposer() { oldI++; }
  var newI = 0;
  function newDisposer() { newI++; }

  // add tests
  return suite
    .add('old unsubscribe with unsubscriber', function () {
      var s = new OldDisposable.create(oldDisposer);
      s.dispose();
    })
    .add('new unsubscribe with unsubscriber', function () {
      var s = new NewSubscription(newDisposer);
      s.unsubscribe();
    });
};