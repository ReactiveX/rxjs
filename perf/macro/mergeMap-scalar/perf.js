var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2MergeMapRange = document.querySelector('#rx-2-mergeMap-range-to-scalar');
var RxNextMergeMapRange = document.querySelector('#rx-3-mergeMap-range-to-scalar');

var Rx2ObservableReturn = Rx.Observable.return;
var RxNextObservableReturn = RxNext.Observable.of;

var RxNextTestObservable = RxNext.Observable.range(0, numIterations);
var Rx2TestObservable = Rx.Observable.range(0, numIterations);

function projectionRxNext(x) {
  return RxNextObservableReturn(x + '!!!');
}

function projectionRx2(x) {
  return Rx2ObservableReturn(x + '!!!');
}

Rx2MergeMapRange.addEventListener('click', function () {
  Rx2TestObservable.mergeMap(projectionRx2).subscribe();
});

RxNextMergeMapRange.addEventListener('click', function () {
  RxNextTestObservable.mergeMap(projectionRxNext).subscribe();
});

