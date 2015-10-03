var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var window = { count: numIterations / 2, skip: numIterations / 4 };

var Rx2BufferCount = document.querySelector('#rx-2-bufferCount');
var RxNextBufferCount = document.querySelector('#rx-3-bufferCount');

var Rx2TestObservable = Rx.Observable.range(0, numIterations);
var RxNextTestObservable = RxNext.Observable.range(0, numIterations);

Rx2BufferCount.addEventListener('click', function () {
  Rx2TestObservable.bufferWithCount(window.count, window.skip).subscribe();
});

RxNextBufferCount.addEventListener('click', function () {
  RxNextTestObservable.bufferCount(window.count, window.skip).subscribe();
});