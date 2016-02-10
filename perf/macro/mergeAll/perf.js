var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2MergeAll = document.querySelector('#rx-2-mergeAll');
var RxNextMergeAll = document.querySelector('#rx-3-mergeAll');

var Rx2TestObservable = Rx.Observable.range(0, numIterations)
  .map(function (x) { return Rx.Observable.range(0, numIterations); });
var RxNextTestObservable = RxNext.Observable.range(0, numIterations)
  .map(function (x) { return RxNext.Observable.range(0, numIterations); });

Rx2MergeAll.addEventListener('click', function () {
  Rx2TestObservable.mergeAll().subscribe();
});

RxNextMergeAll.addEventListener('click', function () {
  RxNextTestObservable.mergeAll().subscribe();
});