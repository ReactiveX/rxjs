var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2Merge = document.querySelector('#rx-2-merge');
var RxNextMerge = document.querySelector('#rx-3-merge');

var Rx2TestObservable = Rx.Observable.range(0, numIterations);
var RxNextTestObservable = RxNext.Observable.range(0, numIterations);

var Rx2TestArgObservable = Rx.Observable.range(0, numIterations);
var RxNextTestArgObservable = RxNext.Observable.range(0, numIterations);

Rx2Merge.addEventListener('click', function () {
  Rx2TestObservable.merge(Rx2TestArgObservable).subscribe();
});

RxNextMerge.addEventListener('click', function () {
  RxNextTestObservable.merge(RxNextTestArgObservable).subscribe();
});