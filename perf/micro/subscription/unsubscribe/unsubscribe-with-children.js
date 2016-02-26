var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var OldDisposable = RxOld.CompositeDisposable;
  var NewSubscription = RxNew.Subscription;

  function unsubscriber() {}

  // add tests
  return suite
    .add('old unsubscribe with children', function () {
      var s = new OldDisposable();
      s.add(new OldDisposable());
      s.add(new OldDisposable());
      s.add(new OldDisposable());
      s.dispose();
    })
    .add('new unsubscribe with children', function () {
      var s = new NewSubscription(unsubscriber);
      s.add(new NewSubscription(unsubscriber));
      s.add(new NewSubscription(unsubscriber));
      s.add(new NewSubscription(unsubscriber));
      s.unsubscribe();
    });
};