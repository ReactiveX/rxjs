var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2FlatMapRange = document.querySelector('#rx-2-flatmap-range-to-scalar');
var RxNextFlatMapRange = document.querySelector('#rx-3-flatmap-range-to-scalar');

var Rx2ObservableReturn = Rx.Observable.return;
var RxNextObservableReturn = RxNext.Observable.return;

var Rx2TestRange = Rx.Observable.range(0, numIterations);
var Rx2TestScalar = Rx.Observable.return(numIterations);
var RxNextTestRange = RxNext.Observable.range(0, numIterations);
var RxNextTestScalar = RxNext.Observable.return(numIterations);

Rx2FlatMapRange.addEventListener('click', function() {
  Rx2TestRange.flatMap(projectionRx2).subscribe();
});

RxNextFlatMapRange.addEventListener('click', function() {
  RxNextTestRange.flatMap(projectionRxNext).subscribe();
});

function projectionRxNext(x) {
  return RxNextObservableReturn(x + '!!!');
};

function projectionRx2(x) {
  return Rx2ObservableReturn(x + '!!!');
};
