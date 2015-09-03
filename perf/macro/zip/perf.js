var iterationInput = document.querySelector('input[name=iteration]');
var match = /iterations=(\w+)/.exec(decodeURIComponent(location.search));

if (match) {
  iterationInput.value = match[1];
}

var numIterations = iterationInput.valueAsNumber || 1000;

var Rx2Zip = document.querySelector('#rx-2-zip');
var RxNextZip = document.querySelector('#rx-3-zip');

var Rx2TestObservable = Rx.Observable.create(generator);
var RxNextTestObservable = new RxNext.Observable(generator);

var Rx2TestArgObservable = Rx.Observable.create(generator);
var RxNextTestArgObservable = new RxNext.Observable(generator);

Rx2Zip.addEventListener('click', function() {
  Rx2TestObservable.zip(Rx2TestArgObservable).subscribe();
});

RxNextZip.addEventListener('click', function() {
  RxNextTestObservable.zip(RxNextTestArgObservable).subscribe();
});

function generator(observer) {
  var index = -1;
  while(++index < numIterations) {
    observer.onNext(index);
  }
  observer.onCompleted();
}
