var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2Zip = document.querySelector('#rx-2-zip');
var RxNextZip = document.querySelector('#rx-3-zip');

var Rx2TestObservable = Rx.Observable.range(0, numIterations);
var RxNextTestObservable = RxNext.Observable.range(0, numIterations);

var Rx2TestArgObservable = Rx.Observable.range(0, numIterations);
var RxNextTestArgObservable = RxNext.Observable.range(0, numIterations);

Rx2Zip.addEventListener('click', function () {
  Rx2TestObservable.zip(Rx2TestArgObservable).subscribe();
});

RxNextZip.addEventListener('click', function () {
  RxNextTestObservable.zip(RxNextTestArgObservable).subscribe();
});