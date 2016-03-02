/* globals describe, it, expect, hot, expectObservable */
var Rx = require('../dist/cjs/Rx');
var Subject = Rx.Subject;
var Observable = Rx.Observable;

describe('backwards-compatible', function () {
  describe('Subscriber', function () {
    it('should alias next as onNext', function (done) {
      Observable.create(function (subscriber) {
        subscriber.onNext('compatible');
      })
      .subscribe(function (message) {
        if (message !== 'compatible') {
          done(new Error('Something went wrong.'));
        } else {
          done();
        }
      });
    });

    it('should alias error as onError', function (done) {
      Observable.create(function (subscriber) {
        subscriber.onError('compatible');
      })
      .subscribe(null, function (message) {
        if (message !== 'compatible') {
          done(new Error('Something went wrong.'));
        } else {
          done();
        }
      });
    });

    it('should alias complete as onCompleted', function (done) {
      Observable.create(function (subscriber) {
        subscriber.onCompleted();
      })
      .subscribe(null, null, function () {
        done();
      });
    });

    it('should be backwards-compatible with Rx4-style Object Observers', function (done) {
      var onNextCalled = false;
      var onErrorCalled = false;
      var onCompletedCalled = false;

      var success = Observable.create(function (subscriber) {
        subscriber.next('compatible');
        subscriber.complete();
      });

      var failure = Observable.create(function (subscriber) {
        subscriber.error('compatible');
      });

      success.subscribe({
        onNext: function (x) { onNextCalled = (x === 'compatible'); },
        onCompleted: function () { onCompletedCalled = true; }
      });

      failure.subscribe({
        onError: function (e) { onErrorCalled = (e === 'compatible'); }
      });

      if (onNextCalled && onErrorCalled && onCompletedCalled) {
        done();
      } else {
        done('Something went wrong.');
      }
    });

    it('should alias unsubscribe as dispose', function (done) {
      var disposeCalled = false;
      var disposable = Observable.create(function (subscriber) {
        return function () {
          disposeCalled = true;
        };
      })
      .subscribe({
        next: done.bind(null, new Error('Should not be called.')),
        error: done.bind(null, new Error('Should not be called.')),
        completed: done.bind(null, new Error('Should not be called.'))
      });

      disposable.dispose();

      if (disposeCalled) {
        done();
      } else {
        done('Something went wrong.');
      }
    });
  });

  describe('Subject', function () {
    it('should alias next as onNext', function (done) {
      var subject = new Subject();
      subject.subscribe(function (message) {
        if (message !== 'compatible') {
          done(new Error('Something went wrong.'));
        } else {
          done();
        }
      });
      subject.onNext('compatible');
    });

    it('should alias error as onError', function (done) {
      var subject = new Subject();
      subject.subscribe(null, function (message) {
        if (message !== 'compatible') {
          done(new Error('Something went wrong.'));
        } else {
          done();
        }
      });
      subject.onError('compatible');
    });

    it('should alias complete as onCompleted', function (done) {
      var subject = new Subject();
      subject.subscribe(null, null, function () {
        done();
      });
      subject.onCompleted();
    });

    it('should be backwards-compatible with Rx4-style Object Observers', function (done) {
      var onNextCalled = false;
      var onErrorCalled = false;
      var onCompletedCalled = false;

      var success = new Subject();
      var failure = new Subject();

      success.subscribe({
        onNext: function (x) { onNextCalled = (x === 'compatible'); },
        onCompleted: function () { onCompletedCalled = true; }
      });

      failure.subscribe({
        onError: function (e) { onErrorCalled = (e === 'compatible'); }
      });

      success.next('compatible');
      success.complete();

      failure.error('compatible');

      if (onNextCalled && onErrorCalled && onCompletedCalled) {
        done();
      } else {
        done('Something went wrong.');
      }
    });

    it('should alias unsubscribe as dispose', function (done) {
      var disposeCalled = false;
      var subjectDisposeCalled = false;
      var subject = new Subject();

      subject.add(function () {
        subjectDisposeCalled = true;
      });

      var disposable = subject.subscribe({
        next: done.bind(null, new Error('Should not be called.')),
        error: done.bind(null, new Error('Should not be called.')),
        completed: done.bind(null, new Error('Should not be called.'))
      });

      disposable.add(function () {
        disposeCalled = true;
      });

      subject.dispose();
      disposable.dispose();

      if (disposeCalled && subjectDisposeCalled) {
        done();
      } else {
        done('Something went wrong.');
      }
    });
  });
});
