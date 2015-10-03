var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2CombineLatest = document.querySelector('#rx-2-combineLatest');
var RxNextCombineLatest = document.querySelector('#rx-3-combineLatest');

var Rx2TestObservable = Rx.Observable.range(0, numIterations);
var RxNextTestObservable = RxNext.Observable.range(0, numIterations);

var Rx2TestArgObservable = Rx.Observable.range(0, numIterations);
var RxNextTestArgObservable = RxNext.Observable.range(0, numIterations);

Rx2CombineLatest.addEventListener('click', function () {
  Rx2TestObservable.combineLatest(Rx2TestArgObservable).subscribe();
});

RxNextCombineLatest.addEventListener('click', function () {
  RxNextTestObservable.combineLatest(RxNextTestArgObservable).subscribe();
});