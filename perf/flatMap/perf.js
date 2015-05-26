var noop = function(){};

var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));
if (match) {
  iterationInput.value = match[1];
}
var numIterations = iterationInput.valueAsNumber;

var Rx3TestObservable = new Rx3.Observable(function(generator) {
  var i = numIterations;
  while (i--) {
    generator.next(i);
  }

  generator.return();

  //HACK: junk subscription
  return new Rx3.Subscription(noop);
});

var Rx2TestObservable = Rx.Observable.create(function(observer) {
  var i = numIterations;
  while (i--) {
    observer.onNext(i);
  }

  observer.onCompleted();

  //HACK: junk subscription
  return new noop;
});

var projectionRx3 = function(x) {
  return new Rx3.Observable(function(generator) {
    // var tid = setTimeout(function(){
      generator.next(x + '!!!');
      generator.return();
    // });
    return new Rx3.Subscription(function(){
      // clearTimeout(tid);
    });
  });
};

var projectionRx2 = function(x) {
  return Rx.Observable.create(function(observer) {
    // var tid = setTimeout(function(){
      observer.onNext(x + '!!!');
      observer.onCompleted();
    // }, 0);

    return function(){
      // clearTimeout(tid);
    }
  });
};

var rx3FlatMap = document.querySelector('#rx-3-flatmap');
var rx2FlatMap = document.querySelector('#rx-2-flatmap');
rx3FlatMap.addEventListener('click', function() {
  Rx3TestObservable.flatMap(projectionRx3).observer({
    next: noop,
    error: noop,
    return: noop
  });
});

rx2FlatMap.addEventListener('click', function() {
  Rx2TestObservable.flatMap(projectionRx2).
    forEach(noop, noop, noop);
});
