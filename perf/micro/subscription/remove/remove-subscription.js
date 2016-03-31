var RxOld = require('rx');
var RxNew = require('../../../../index');

module.exports = function empty(suite) {
  var OldDisposable = RxOld.CompositeDisposable;
  var NewSubscription = RxNew.Subscription;

  function unsubscriber() {}

  // add tests
  return suite
    .add('old remove subscription', function () {
      var s = new OldDisposable();
      var item1 = new OldDisposable();
      var item2 = new OldDisposable();
      var item3 = new OldDisposable();
      s.add(item1);
      s.add(item2);
      s.add(item3);
      s.remove(item1);
      s.remove(item2);
      s.remove(item3);
    })
    .add('new remove subscription', function () {
      var s = new NewSubscription(unsubscriber);
      var item1 = new NewSubscription(unsubscriber);
      var item2 = new NewSubscription(unsubscriber);
      var item3 = new NewSubscription(unsubscriber);
      s.add(item1);
      s.add(item2);
      s.add(item3);
      s.remove(item1);
      s.remove(item2);
      s.remove(item3);
    });
};