var noop = function(){};

var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));
if (match) {
  iterationInput.value = match[1];
}
var numIterations = iterationInput.valueAsNumber;

var RxNextTestObservable = new RxNext.Observable(function(subscriber) {
  var i = numIterations;
  while (i--) {
    subscriber.next(i);
  }

  subscriber.complete();

  //HACK: junk subscription
  // return new RxNext.Subscription(noop);
});

var Rx2TestObservable = Rx.Observable.create(function(observer) {
  var i = numIterations;
  while (i--) {
    observer.onNext(i);
  }

  observer.onCompleted();

  //HACK: junk subscription
  // return new noop;
});

var projectionRxNext = function(x) {
  return new RxNext.Observable(function(subscriber) {
    // var tid = setTimeout(function(){
      subscriber.next(x + '!!!');
      subscriber.complete();
    // });
    // return new RxNext.Subscription(function(){
    //   // clearTimeout(tid);
    // });
  });
};

var projectionRx2 = function(x) {
  return Rx.Observable.create(function(observer) {
    // var tid = setTimeout(function(){
      observer.onNext(x + '!!!');
      observer.onCompleted();
    // }, 0);

    // return function(){
    //   // clearTimeout(tid);
    // }
  });
};

var RxNextFlatMap = document.querySelector('#rx-3-flatmap');
var rx2FlatMap = document.querySelector('#rx-2-flatmap');
RxNextFlatMap.addEventListener('click', function() {
  RxNextTestObservable.flatMap(projectionRxNext)[Symbol.observer]({
    next: noop,
    error: noop,
    return: noop
  });
});

rx2FlatMap.addEventListener('click', function() {
  Rx2TestObservable.flatMap(projectionRx2).
    forEach(noop, noop, noop);
});
