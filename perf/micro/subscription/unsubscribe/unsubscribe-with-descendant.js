var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var OldDisposable = RxOld.CompositeDisposable;
  var NewSubscription = RxNew.Subscription;

  function unsubscriber() {}

  // add tests
  return suite
    .add('old unsubscribe with descendant', function () {
      var s = new OldDisposable();
      var d = new OldDisposable();
      d.add(new OldDisposable());
      s.add(d);
      s.dispose();
    })
    .add('new unsubscribe with descendant', function () {
      var s = new NewSubscription(unsubscriber);
      var d = new NewSubscription();
      d.add(new NewSubscription(unsubscriber));
      s.add(d);
      s.unsubscribe();
    });
};