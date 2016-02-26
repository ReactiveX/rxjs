var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var OldDisposable = RxOld.Disposable;
  var NewSubscription = RxNew.Subscription;

  // add tests
  return suite
    .add('old unsubscribe without unsubscriber', function () {
      var s = new OldDisposable.create();
      s.dispose();
    })
    .add('new unsubscribe without unsubscriber', function () {
      var s = new NewSubscription();
      s.unsubscribe();
    });
};