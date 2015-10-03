var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var window = { count: numIterations / 2, skip: numIterations / 4 };

var Rx2WindowCount = document.querySelector('#rx-2-windowCount');
var RxNextWindowCount = document.querySelector('#rx-3-windowCount');

var Rx2TestObservable = Rx.Observable.range(0, numIterations);
var RxNextTestObservable = RxNext.Observable.range(0, numIterations);

Rx2WindowCount.addEventListener('click', function () {
  Rx2TestObservable.windowWithCount(window.count, window.skip).subscribe();
});

RxNextWindowCount.addEventListener('click', function () {
  RxNextTestObservable.windowCount(window.count, window.skip).subscribe();
});