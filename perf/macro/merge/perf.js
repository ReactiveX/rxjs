var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2Merge = document.querySelector('#rx-2-merge');
var RxNextMerge = document.querySelector('#rx-3-merge');

var Rx2TestObservable = Rx.Observable.create(generator);
var RxNextTestObservable = new RxNext.Observable(generator);

var Rx2TestArgObservable = Rx.Observable.create(generator);
var RxNextTestArgObservable = new RxNext.Observable(generator);

Rx2Merge.addEventListener('click', function() {
  Rx2TestObservable.merge(Rx2TestArgObservable).subscribe();
});

RxNextMerge.addEventListener('click', function() {
  RxNextTestObservable.merge(RxNextTestArgObservable).subscribe();
});

function generator(observer) {
  var index = -1;
  while(++index < numIterations) {
    observer.onNext(index);
  }
  observer.onCompleted();
}
