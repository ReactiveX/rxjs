var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var RxNextFlatMap = document.querySelector('#rx-3-flatmap');
var Rx2FlatMap = document.querySelector('#rx-2-flatmap');

var RxNextTestObservable = new RxNext.Observable(function(observer) {
  var index = -1;
  while(++index < numIterations) {
    observer.next(index);
  }
  observer.completed();
});

var Rx2TestObservable = Rx.Observable.create(function(observer) {
  var index = -1;
  while(++index < numIterations) {
    observer.onNext(index);
  }
  observer.onCompleted();
});

RxNextFlatMap.addEventListener('click', function() {
  RxNextTestObservable.flatMap(projectionRxNext).subscribe();
});

Rx2FlatMap.addEventListener('click', function() {
  Rx2TestObservable.flatMap(projectionRx2).subscribe();
});

var RxNextObservable = RxNext.Observable;
var Rx2ObservableCreate = Rx.Observable.create;

function projectionRxNext(x) {
  return new RxNextObservable(function(observer) {
    observer.next(x + '!!!');
    observer.complete();
  });
};

function projectionRx2(x) {
  return Rx2ObservableCreate(function(observer) {
    observer.onNext(x + '!!!');
    observer.onCompleted();
  });
};

