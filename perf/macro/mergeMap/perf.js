var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var RxNextMergeMap = document.querySelector('#rx-3-mergeMap');
var Rx2MergeMap = document.querySelector('#rx-2-mergeMap');

var RxNextTestObservable = RxNext.Observable.range(0, numIterations);
var Rx2TestObservable = Rx.Observable.range(0, numIterations);

var RxNextObservable = RxNext.Observable;
var Rx2ObservableCreate = Rx.Observable.create;

function projectionRxNext(x) {
  return new RxNextObservable(function (observer) {
    observer.next(x + '!!!');
    observer.complete();
  });
}

function projectionRx2(x) {
  return Rx2ObservableCreate(function (observer) {
    observer.onNext(x + '!!!');
    observer.onCompleted();
  });
}

RxNextMergeMap.addEventListener('click', function () {
  RxNextTestObservable.mergeMap(projectionRxNext).subscribe();
});

Rx2MergeMap.addEventListener('click', function () {
  Rx2TestObservable.flatMap(projectionRx2).subscribe();
});

