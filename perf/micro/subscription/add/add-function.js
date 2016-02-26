var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var OldDisposable = RxOld.CompositeDisposable;
  var NewSubscription = RxNew.Subscription;

  function unsubscriber() {}

  // add tests
  return suite
    .add('old add function', function () {
      var s = new OldDisposable();
      s.add(new OldDisposable());
      s.add(new OldDisposable());
      s.add(new OldDisposable());
    })
    .add('new add function', function () {
      var s = new NewSubscription(unsubscriber);
      s.add(unsubscriber);
      s.add(unsubscriber);
      s.add(unsubscriber);
    });
};