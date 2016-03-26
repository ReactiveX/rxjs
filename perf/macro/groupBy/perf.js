var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var source = Array.apply(null, { length: numIterations }).map(function (item, index) {
  return { key: index % 5 };
});

var Rx2GroupBy = document.querySelector('#rx-2-groupBy');
var RxNextGroupBy = document.querySelector('#rx-3-groupBy');

var Rx2TestObservable = Rx.Observable.from(source);
var RxNextTestObservable = RxNext.Observable.from(source);

function group(x) {
  return x.key;
}

Rx2GroupBy.addEventListener('click', function () {
  Rx2TestObservable.groupBy(group).subscribe();
});

RxNextGroupBy.addEventListener('click', function () {
  RxNextTestObservable.groupBy(group).subscribe();
});
