var noop = function(){};

var Rx3TestObservable = new Observable(function(generator) {
  debugger
  var i = 1000;
  while (i--) {
    generator.next(i);
  }

  generator.return();

  //HACK: junk subscription
  return new Subscription(noop);
});

var Rx2TestObservable = Rx.Observable.create(function(observer) {
  var i = 1000;
  while (i--) {
    observer.onNext(i);
  }

  observer.onCompleted();

  //HACK: junk subscription
  return new noop;
});

var projectionRx3 = function(x) {
  debugger
  return new Observable(function(generator) {
    var tid = setTimeout(function(){
      console.log('timeout');
      generator.next(x + '!!!');
      generator.return();
    });
    return new Subscription(function(){
      clearTimeout(tid);
    });
  });
};

var projectionRx2 = function(x) {
  return Rx.Observable.create(function(observer) {
    var tid = setTimeout(function(){
      observer.onNext(x + '!!!');
      observer.onCompleted();
    }, 0);

    return function(){
      clearTimeout(tid);
    }
  });
};

var rx3FlatMap = document.querySelector('#rx-3-flatmap');
var rx2FlatMap = document.querySelector('#rx-2-flatmap');
rx3FlatMap.addEventListener('click', function() {
  debugger
  console.log('rx3 clicked');
  Rx3TestObservable.flatMap(projectionRx3).observer({
    next: noop,
    error: noop,
    return: noop
  });
});

rx2FlatMap.addEventListener('click', function() {
  console.log('rx2 clicked');
  Rx2TestObservable.flatMap(projectionRx2).
    forEach(noop, noop, noop);
});
