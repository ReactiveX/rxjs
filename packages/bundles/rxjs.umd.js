(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.RxJS = {})));
}(this, (function (exports) { 'use strict';

  (function (FOType) {
      FOType[FOType["SUBSCRIBE"] = 0] = "SUBSCRIBE";
      FOType[FOType["NEXT"] = 1] = "NEXT";
      FOType[FOType["COMPLETE"] = 2] = "COMPLETE";
      FOType[FOType["ERROR"] = 3] = "ERROR";
      FOType[FOType["DISPOSE"] = 4] = "DISPOSE";
  })(exports.FOType || (exports.FOType = {}));

  function sinkFromHandlers(nextHandler, errorHandler, completeHandler) {
      return function (type, arg, subs) {
          switch (type) {
              case exports.FOType.NEXT:
                  if (typeof nextHandler === 'function') {
                      nextHandler(arg, subs);
                  }
                  break;
              case exports.FOType.ERROR:
                  if (typeof errorHandler === 'function') {
                      errorHandler(arg);
                  }
                  break;
              case exports.FOType.COMPLETE:
                  if (typeof completeHandler === 'function') {
                      completeHandler();
                  }
                  break;
              default:
                  break;
          }
      };
  }

  function noop() {
      /* no op */
  }

  function isSubscription(obj) {
      return obj && typeof obj.unsubscribe === 'function'
          && typeof obj.add === 'function'
          && typeof obj.remove === 'function';
  }

  var ERROR_OBJECT = {
      error: null
  };
  /**
   * Executes a user-provided function within a try-catch, and returns either the result
   * or returns {@link ERROR_OBJECT} if an error has occurred. Use {@link resultIsError} to
   * verify whether the result is an error or not.
   *
   * @param fn the user-provided function to wrap in some error handling for safety
   * @param args The arguments to execute the user-provided function with.
   */
  function tryUserFunction(fn) {
      var args = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments[_i];
      }
      ERROR_OBJECT.error = null;
      var result;
      try {
          result = fn.apply(void 0, args);
      }
      catch (err) {
          ERROR_OBJECT.error = err;
          return ERROR_OBJECT;
      }
      return result;
  }
  /**
   * Used to verify whether the result of {@link tryUserFunction} is an error or not. If
   * this returns true, check {@link ERROR_OBJECT}'s error property for the error value.
   */
  function resultIsError(result) {
      return result === ERROR_OBJECT;
  }

  function UnsubscriptionErrorImpl(errors) {
      Error.call(this);
      this.message = errors ?
          errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
      this.name = 'UnsubscriptionError';
      this.errors = errors;
      return this;
  }
  UnsubscriptionErrorImpl.prototype = Object.create(Error.prototype);
  /**
   * An error thrown when one or more errors have occurred during the
   * `unsubscribe` of a {@link Subscription}.
   */
  var UnsubscriptionError = UnsubscriptionErrorImpl;

  var Subscription = function Subscription() {
      var teardowns = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          teardowns[_i] = arguments[_i];
      }
      this._teardowns = teardowns;
      this._closed = false;
  };
  var EMPTY_SUBSCRIPTION = new Subscription();
  EMPTY_SUBSCRIPTION._closed = true;
  Subscription.EMPTY = EMPTY_SUBSCRIPTION;
  var subscriptionProto = Subscription.prototype;
  subscriptionProto.add = function () {
      var _this = this;
      var teardowns = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          teardowns[_i] = arguments[_i];
      }
      var _teardowns = this._teardowns;
      var _loop_1 = function (teardown) {
          if (teardown) {
              if (this_1._closed) {
                  teardownToFunction(teardown)();
              }
              else {
                  if (isSubscription(teardown)) {
                      teardown.add(function () { return _this.remove(teardown); });
                  }
                  _teardowns.push(teardown);
              }
          }
      };
      var this_1 = this;
      for (var _a = 0, teardowns_1 = teardowns; _a < teardowns_1.length; _a++) {
          var teardown = teardowns_1[_a];
          _loop_1(teardown);
      }
  };
  subscriptionProto.remove = function () {
      var teardowns = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          teardowns[_i] = arguments[_i];
      }
      var _teardowns = this._teardowns;
      for (var _a = 0, teardowns_2 = teardowns; _a < teardowns_2.length; _a++) {
          var teardown = teardowns_2[_a];
          if (teardown) {
              var i = _teardowns.indexOf(teardown);
              if (i >= 0) {
                  _teardowns.splice(i, 1);
              }
          }
      }
  };
  subscriptionProto.unsubscribe = function () {
      if (!this._closed) {
          this._closed = true;
          var _teardowns = this._teardowns;
          var unsubError = void 0;
          while (_teardowns.length > 0) {
              var result = tryUserFunction(teardownToFunction(_teardowns.shift()));
              if (resultIsError(result)) {
                  var err = result.error;
                  unsubError = unsubError || new UnsubscriptionError(err instanceof UnsubscriptionError ? err.errors : []);
                  unsubError.errors.push(err);
              }
          }
          if (unsubError)
              throw unsubError;
      }
  };
  Object.defineProperty(subscriptionProto, 'closed', {
      get: function () {
          return this._closed;
      }
  });
  function teardownToFunction(teardown) {
      if (teardown) {
          if (typeof teardown.unsubscribe === 'function') {
              return function () { return teardown.unsubscribe(); };
          }
          else if (typeof teardown === 'function') {
              return teardown;
          }
      }
      return noop;
  }

  function identity(x) {
      return x;
  }

  function pipe() {
      var fns = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          fns[_i] = arguments[_i];
      }
      return pipeArray(fns);
  }
  function pipeArray(fns) {
      if (fns.length <= 0) {
          return identity;
      }
      if (fns.length === 1) {
          return fns[0];
      }
      return function (x) { return fns.reduce(function (prev, fn) { return fn(prev); }, x); };
  }

  function sinkFromObserver(observer) {
      return function (type, arg, subs) {
          switch (type) {
              case exports.FOType.NEXT:
                  if (typeof observer.next === 'function') {
                      observer.next(arg, subs);
                  }
                  break;
              case exports.FOType.ERROR:
                  if (typeof observer.error === 'function') {
                      observer.error(arg);
                  }
                  break;
              case exports.FOType.COMPLETE:
                  if (typeof observer.complete === 'function') {
                      observer.complete();
                  }
                  break;
              default:
                  break;
          }
      };
  }

  /**
   * Because Subjects are `typeof "function"`, we have this method to test to
   * see if something is a partial observer. Technically, anything with at least a `next`,
   * `error`, or `complete` method is a partial observer, and as a legacy, any object,
   * even if it doesn't have any of those methods, is considered a `PartialObserver`.
   *
   * In the future, we will probably want to restrict this only to values with some
   * combination of `next`, `error`, or `complete` methods on them.
   * @param o the value to test
   */
  function isPartialObserver(o) {
      return o && (typeof o === 'object' ||
          typeof o.next === 'function' ||
          typeof o.error === 'function' ||
          typeof o.complete === 'function');
  }

  function sourceAsObservable(source) {
      var result = source;
      result.subscribe = subscribe;
      result.pipe = observablePipe;
      result.forEach = forEach;
      result.toPromise = toPromise;
      if (Symbol && Symbol.observable) {
          result[Symbol.observable] = function () { return result; };
      }
      return result;
  }
  function subscribe(nextOrObserver, errorHandler, completeHandler) {
      var subscription = new Subscription();
      var sink;
      if (nextOrObserver || errorHandler || completeHandler) {
          if (isPartialObserver(nextOrObserver)) {
              sink = sinkFromObserver(nextOrObserver);
          }
          else {
              sink = sinkFromHandlers(nextOrObserver, errorHandler, completeHandler);
          }
      }
      else {
          sink = function () { };
      }
      this(exports.FOType.SUBSCRIBE, safeSink(sink), subscription);
      return subscription;
  }
  function safeSink(sink) {
      return function (type, arg, subs) {
          if (subs.closed) {
              if (type === exports.FOType.ERROR) {
                  console.warn('Error thrown after subscription closed', arg);
              }
          }
          else {
              sink(type, arg, subs);
              if (type >= 2) {
                  subs.unsubscribe();
              }
          }
      };
  }
  function forEach(nextHandler, subscription) {
      var _this = this;
      return new Promise(function (resolve, reject) {
          var completed = false;
          var errored = false;
          if (subscription) {
              subscription.add(function () {
                  if (!completed && !errored) {
                      var error = new Error('forEach aborted');
                      error.name = 'AbortError';
                      reject(error);
                  }
              });
          }
          subscription = subscription || new Subscription();
          _this(exports.FOType.SUBSCRIBE, function (t, v, subs) {
              if (subs.closed) {
                  return;
              }
              switch (t) {
                  case exports.FOType.NEXT:
                      var result = tryUserFunction(nextHandler, v);
                      if (resultIsError(result)) {
                          errored = true;
                          reject(result.error);
                          subs.unsubscribe();
                      }
                      break;
                  case exports.FOType.COMPLETE:
                      completed = true;
                      resolve();
                      subs.unsubscribe();
                      break;
                  case exports.FOType.ERROR:
                      errored = true;
                      reject(v);
                      subs.unsubscribe();
                      break;
                  default:
                      break;
              }
          }, subscription);
      });
  }
  function toPromise() {
      var _this = this;
      return new Promise(function (resolve, reject) {
          _this.subscribe({
              _last: undefined,
              next: function (value) { this._last = value; },
              error: function (err) { reject(err); },
              complete: function () { resolve(this._last); }
          });
      });
  }
  function observablePipe() {
      var operations = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          operations[_i] = arguments[_i];
      }
      return pipeArray(operations)(this);
  }

  function sourceAsSubject(source) {
      source = sourceAsObservable(source);
      source.next = next;
      source.error = error;
      source.complete = complete;
      source.unsubscribe = unsubscribe;
      source.asObservable = asObservable;
      return source;
  }
  function next(value, subs) {
      this(exports.FOType.NEXT, value, subs);
  }
  // NOTE: For error and complete, subscription doesn't matter, as
  // we are passing it from state
  function error(err) {
      this(exports.FOType.ERROR, err, undefined);
  }
  function complete() {
      this(exports.FOType.COMPLETE, undefined, undefined);
  }
  function unsubscribe() {
      this(exports.FOType.DISPOSE, undefined, undefined);
  }
  function asObservable() {
      var _this = this;
      return sourceAsObservable(function (t, v, subs) {
          _this(t, v, subs);
      });
  }

  function ObjectUnsubscribedErrorImpl() {
      Error.call(this);
      this.message = 'object unsubscribed';
      this.name = 'ObjectUnsubscribedError';
      return this;
  }
  ObjectUnsubscribedErrorImpl.prototype = Object.create(Error.prototype);
  /**
   * An error thrown when an action is invalid because the object has been
   * unsubscribed.
   *
   * @see {@link Subject}
   * @see {@link BehaviorSubject}
   *
   * @class ObjectUnsubscribedError
   */
  var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

  function subjectBaseSource() {
      var state;
      var disposed = false;
      return function (type, arg, subs) {
          if (disposed) {
              throw new ObjectUnsubscribedError();
          }
          if (type === exports.FOType.SUBSCRIBE) {
              state = (state || []);
              state.push(arg, subs);
              subs.add(function () {
                  if (!state)
                      return;
                  var i = state.indexOf(arg);
                  state.splice(i, 2);
              });
          }
          else if (type === exports.FOType.DISPOSE) {
              disposed = true;
              state = null;
          }
          else if (state) {
              var copy = state.slice();
              if (type !== exports.FOType.NEXT) {
                  state = undefined;
              }
              for (var i = 0; i < copy.length; i += 2) {
                  copy[i](type, arg, copy[i + 1]);
              }
          }
      };
  }

  var Subject = (function Subject(observer, observable) {
      return sourceAsSubject(arguments.length > 0
          ? frankenSubjectSource(sinkFromObserver(observer), observable)
          : subjectSource());
  });
  function frankenSubjectSource(sink, source) {
      return function (type, arg, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              source(type, arg, subs);
          }
          else {
              sink(type, arg, subs);
          }
      };
  }
  function subjectSource() {
      var base = subjectBaseSource();
      var _completed = false;
      var _hasError = false;
      var _error;
      var _disposed = false;
      return function (type, arg, subs) {
          if (type === exports.FOType.DISPOSE) {
              _disposed = true;
          }
          if (type === exports.FOType.SUBSCRIBE) {
              if (_completed) {
                  arg(exports.FOType.COMPLETE, undefined, subs);
              }
              else if (_hasError) {
                  arg(exports.FOType.ERROR, _error, subs);
              }
          }
          if (_disposed || (!_completed && !_hasError)) {
              if (type === exports.FOType.COMPLETE) {
                  _completed = true;
              }
              else if (type === exports.FOType.ERROR) {
                  _hasError = true;
                  _error = arg;
              }
              base(type, arg, subs);
          }
      };
  }

  var AsyncSubject = (function () {
      var hasValue = false;
      var hasCompleted = false;
      var hasError = false;
      var value;
      var subject = subjectSource();
      var result = (function (type, arg, subs) {
          if (!hasError) {
              switch (type) {
                  case exports.FOType.SUBSCRIBE:
                      if (hasCompleted && hasValue) {
                          arg(exports.FOType.NEXT, value, subs);
                      }
                      break;
                  case exports.FOType.NEXT:
                      if (!hasCompleted && !hasError) {
                          hasValue = true;
                          value = arg;
                      }
                      return;
                  case exports.FOType.ERROR:
                      hasError = true;
                      break;
                  case exports.FOType.COMPLETE:
                      hasCompleted = true;
                      if (hasValue) {
                          subject(exports.FOType.NEXT, value, subs);
                      }
                      break;
              }
          }
          subject(type, arg, subs);
      });
      result = sourceAsSubject(result);
      return result;
  });

  var BehaviorSubject = (function (initialValue) {
      var completed = false;
      var value = initialValue;
      var hasError = false;
      var disposed = false;
      var error;
      var subject = subjectSource();
      var result = (function (type, arg, subs) {
          switch (type) {
              case exports.FOType.SUBSCRIBE:
                  if (!completed && !hasError) {
                      arg(exports.FOType.NEXT, value, subs);
                  }
                  break;
              case exports.FOType.NEXT:
                  value = arg;
                  break;
              case exports.FOType.ERROR:
                  hasError = true;
                  error = arg;
                  break;
              case exports.FOType.COMPLETE:
                  completed = true;
                  break;
              case exports.FOType.DISPOSE:
                  disposed = true;
                  break;
          }
          subject(type, arg, subs);
      });
      result = sourceAsSubject(result);
      result.getValue = function () {
          if (disposed)
              throw new ObjectUnsubscribedError();
          if (hasError)
              throw error;
          return value;
      };
      Object.defineProperty(result, 'value', {
          get: function () {
              return value;
          }
      });
      return result;
  });

  var ConnectableObservable = (function (source, subjectFactory) {
      var _subject;
      var connectable = function (type, sink, subs) {
          _subject = _subject || subjectFactory();
          _subject(exports.FOType.SUBSCRIBE, sink, subs);
      };
      connectable = sourceAsObservable(connectable);
      connectable.connect = function () {
          _subject = _subject || subjectFactory();
          var subs = new Subscription();
          source(exports.FOType.SUBSCRIBE, _subject, subs);
          return subs;
      };
      connectable.refCount = refCount;
      return connectable;
  });
  function refCount() {
      var _this = this;
      var _refCounter = 0;
      var _connection;
      return sourceAsObservable(function (type, sink, subs) {
          _refCounter++;
          subs.add(function () {
              _refCounter--;
              if (_refCounter === 0) {
                  _connection.unsubscribe();
              }
          });
          if (_refCounter === 1) {
              _connection = _this.connect();
          }
      });
  }

  var EMPTY_SOURCE = function (type, sink, subs) {
      if (type === exports.FOType.SUBSCRIBE) {
          sink(exports.FOType.COMPLETE, undefined, subs);
      }
  };
  var EMPTY = sourceAsObservable(EMPTY_SOURCE);

  /* tslint:enable:max-line-length */
  function of() {
      var values = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          values[_i] = arguments[_i];
      }
      return sourceAsObservable(ofSource(values));
  }
  function ofSource(values) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              for (var i = 0; i < values.length && !subs.closed; i++) {
                  if (subs.closed)
                      return;
                  sink(exports.FOType.NEXT, values[i], subs);
              }
              if (!subs.closed)
                  sink(exports.FOType.COMPLETE, undefined, subs);
          }
      };
  }
  var x = of(1, 'test');

  function throwError(err) {
      return sourceAsObservable(function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE)
              sink(exports.FOType.ERROR, err, subs);
      });
  }

  var Notification = (function (kind, value, error) {
      this.kind = kind;
      this.value = value;
      this.error = error;
  });
  Notification.prototype = Object.create(Object.prototype);
  Notification.prototype.constructor = Notification;
  Object.defineProperty(Notification.prototype, 'hasValue', {
      get: function () {
          return this.kind === 'N';
      }
  });
  Notification.prototype.observe = function (observer, subscription) {
      switch (this.kind) {
          case 'N':
              return observer.next && observer.next(this.value, subscription || new Subscription());
          case 'E':
              return observer.error && observer.error(this.error);
          case 'C':
              return observer.complete && observer.complete();
      }
  };
  Notification.prototype["do"] = function (next, error, complete, subscription) {
      var kind = this.kind;
      switch (kind) {
          case 'N':
              return next && next(this.value, subscription || new Subscription());
          case 'E':
              return error && error(this.error);
          case 'C':
              return complete && complete();
      }
  };
  Notification.prototype.accept = function (nextOrObserver, error, complete, subscription) {
      if (isPartialObserver(nextOrObserver)) {
          return this.observe(nextOrObserver, subscription);
      }
      else {
          return this["do"](nextOrObserver, error, complete, subscription);
      }
  };
  Notification.prototype.toObservable = function () {
      var kind = this.kind;
      switch (kind) {
          case 'N':
              return of(this.value);
          case 'E':
              return throwError(this.error);
          case 'C':
              return EMPTY;
      }
      throw new Error('unexpected notification kind value');
  };
  var COMPLETE_NOTIFICATION = new Notification('C');
  var UNDEFINED_NEXT_NOTIFICATION = new Notification('N');
  Notification.createNext = function (value) { return value === undefined ? UNDEFINED_NEXT_NOTIFICATION : new Notification('N', value); };
  Notification.createError = function (error) { return new Notification('E', undefined, error); };
  Notification.createComplete = function () { return COMPLETE_NOTIFICATION; };

  var CLOSED = 'closed';
  var rxSubs = Symbol('rxjs subscription');
  function createSubscriber(dest, subs) {
      var closed = false;
      subs.add(function () { return closed = true; });
      var result = (function (type, arg, subs) {
          switch (type) {
              case exports.FOType.NEXT:
                  if (!closed) {
                      dest(exports.FOType.NEXT, arg, subs);
                  }
                  break;
              case exports.FOType.ERROR:
                  if (!closed) {
                      closed = true;
                      dest(exports.FOType.ERROR, arg, subs);
                      subs.unsubscribe();
                  }
                  break;
              case exports.FOType.COMPLETE:
                  if (!closed) {
                      closed = true;
                      dest(exports.FOType.COMPLETE, undefined, subs);
                      subs.unsubscribe();
                  }
                  break;
              default:
          }
      });
      result.next = next$1;
      result.error = error$1;
      result.complete = complete$1;
      result[rxSubs] = subs;
      Object.defineProperty(result, CLOSED, {
          get: function () { return closed; }
      });
      return result;
  }
  function next$1(value) {
      this(exports.FOType.NEXT, value, this[rxSubs]);
  }
  function error$1(err) {
      this(exports.FOType.ERROR, err, this[rxSubs]);
  }
  function complete$1() {
      this(exports.FOType.COMPLETE, undefined, this[rxSubs]);
  }

  /** The Observable constructor */
  var Observable = function (init) {
      return sourceAsObservable(function (type, dest, subs) {
          if (init) {
              var subscriber = createSubscriber(dest, subs);
              var teardown = tryUserFunction(init, subscriber);
              if (resultIsError(teardown)) {
                  subscriber(exports.FOType.ERROR, teardown.error, subs);
                  subs.unsubscribe();
                  return;
              }
              subs.add(teardown);
          }
      });
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function hostReportError(err) {
      setTimeout(function () { throw err; });
  }

  var EMPTY_OBSERVER = {
      next: function () { },
      error: function () { },
      complete: function () { }
  };
  /**
   * Implements the {@link Observer} interface and extends the
   * {@link Subscription} class. While the {@link Observer} is the public API for
   * consuming the values of an {@link Observable}, all Observers get converted to
   * a Subscriber, in order to provide Subscription-like capabilities such as
   * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
   * implementing operators, but it is rarely used as a public API.
   *
   * @class Subscriber<T>
   * @deprecated Do not use or subclass. This type is being phased out and is not used in RxJS 7.
   */
  var Subscriber = /** @class */ (function (_super) {
      __extends(Subscriber, _super);
      /**
       * @param {Observer|function(value: T): void} [destinationOrNext] A partially
       * defined Observer or a `next` callback function.
       * @param {function(e: ?any): void} [error] The `error` callback of an
       * Observer.
       * @param {function(): void} [complete] The `complete` callback of an
       * Observer.
       */
      function Subscriber(destinationOrNext, error, complete) {
          var _this = _super.call(this) || this;
          /** @internal */ _this.syncErrorValue = null;
          /** @internal */ _this.syncErrorThrown = false;
          /** @internal */ _this.syncErrorThrowable = false;
          _this.isStopped = false;
          _this._parentSubscription = null;
          switch (arguments.length) {
              case 0:
                  _this.destination = EMPTY_OBSERVER;
                  break;
              case 1:
                  if (!destinationOrNext) {
                      _this.destination = EMPTY_OBSERVER;
                      break;
                  }
                  if (typeof destinationOrNext === 'object') {
                      if (destinationOrNext instanceof Subscriber) {
                          _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                          _this.destination = destinationOrNext;
                          destinationOrNext.add(_this);
                      }
                      else {
                          _this.syncErrorThrowable = true;
                          _this.destination = new SafeSubscriber(_this, destinationOrNext);
                      }
                      break;
                  }
              default:
                  _this.syncErrorThrowable = true;
                  _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                  break;
          }
          return _this;
      }
      /**
       * A static factory for a Subscriber, given a (potentially partial) definition
       * of an Observer.
       * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
       * @param {function(e: ?any): void} [error] The `error` callback of an
       * Observer.
       * @param {function(): void} [complete] The `complete` callback of an
       * Observer.
       * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
       * Observer represented by the given arguments.
       * @nocollapse
       */
      Subscriber.create = function (next, error, complete) {
          var subscriber = new Subscriber(next, error, complete);
          subscriber.syncErrorThrowable = false;
          return subscriber;
      };
      /**
       * The {@link Observer} callback to receive notifications of type `next` from
       * the Observable, with a value. The Observable may call this method 0 or more
       * times.
       * @param {T} [value] The `next` value.
       * @return {void}
       */
      Subscriber.prototype.next = function (value) {
          if (!this.isStopped) {
              this._next(value);
          }
      };
      /**
       * The {@link Observer} callback to receive notifications of type `error` from
       * the Observable, with an attached `Error`. Notifies the Observer that
       * the Observable has experienced an error condition.
       * @param {any} [err] The `error` exception.
       * @return {void}
       */
      Subscriber.prototype.error = function (err) {
          if (!this.isStopped) {
              this.isStopped = true;
              this._error(err);
          }
      };
      /**
       * The {@link Observer} callback to receive a valueless notification of type
       * `complete` from the Observable. Notifies the Observer that the Observable
       * has finished sending push-based notifications.
       * @return {void}
       */
      Subscriber.prototype.complete = function () {
          if (!this.isStopped) {
              this.isStopped = true;
              this._complete();
          }
      };
      Subscriber.prototype.unsubscribe = function () {
          if (this.closed) {
              return;
          }
          this.isStopped = true;
          _super.prototype.unsubscribe.call(this);
      };
      Subscriber.prototype._next = function (value) {
          this.destination.next(value, this);
      };
      Subscriber.prototype._error = function (err) {
          this.destination.error(err);
          this.unsubscribe();
      };
      Subscriber.prototype._complete = function () {
          this.destination.complete();
          this.unsubscribe();
      };
      return Subscriber;
  }(Subscription));
  /**
   * We need this JSDoc comment for affecting ESDoc.
   * @ignore
   * @extends {Ignored}
   * @deprecated Do not use, legacy support for RxJS 6
   */
  var SafeSubscriber = /** @class */ (function (_super) {
      __extends(SafeSubscriber, _super);
      function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
          var _this = _super.call(this) || this;
          _this._parentSubscriber = _parentSubscriber;
          var next;
          var context = _this;
          if (typeof observerOrNext === 'function') {
              next = observerOrNext;
          }
          else if (observerOrNext) {
              next = observerOrNext.next;
              error = observerOrNext.error;
              complete = observerOrNext.complete;
              if (observerOrNext !== EMPTY_OBSERVER) {
                  context = Object.create(observerOrNext);
                  if (typeof context.unsubscribe === 'function') {
                      _this.add(context.unsubscribe.bind(context));
                  }
                  context.unsubscribe = _this.unsubscribe.bind(_this);
              }
          }
          _this._context = context;
          _this._next = function (value) { return next(value, _this); };
          _this._error = error;
          _this._complete = complete;
          return _this;
      }
      SafeSubscriber.prototype.next = function (value) {
          if (!this.isStopped && this._next) {
              var _parentSubscriber = this._parentSubscriber;
              if (!_parentSubscriber.syncErrorThrowable) {
                  this.__tryOrUnsub(this._next, value);
              }
              else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                  this.unsubscribe();
              }
          }
      };
      SafeSubscriber.prototype.error = function (err) {
          if (!this.isStopped) {
              var _parentSubscriber = this._parentSubscriber;
              if (this._error) {
                  if (!_parentSubscriber.syncErrorThrowable) {
                      this.__tryOrUnsub(this._error, err);
                      this.unsubscribe();
                  }
                  else {
                      this.__tryOrSetError(_parentSubscriber, this._error, err);
                      this.unsubscribe();
                  }
              }
              else {
                  hostReportError(err);
                  this.unsubscribe();
              }
          }
      };
      SafeSubscriber.prototype.complete = function () {
          var _this = this;
          if (!this.isStopped) {
              var _parentSubscriber = this._parentSubscriber;
              if (this._complete) {
                  var wrappedComplete = function () { return _this._complete.call(_this._context); };
                  if (!_parentSubscriber.syncErrorThrowable) {
                      this.__tryOrUnsub(wrappedComplete);
                      this.unsubscribe();
                  }
                  else {
                      this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                      this.unsubscribe();
                  }
              }
              else {
                  this.unsubscribe();
              }
          }
      };
      SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
          try {
              fn.call(this._context, value);
          }
          catch (err) {
              this.unsubscribe();
              hostReportError(err);
          }
      };
      SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
          try {
              fn.call(this._context, value);
          }
          catch (err) {
              hostReportError(err);
              return true;
          }
          return false;
      };
      /** @internal This is an internal implementation detail, do not use. */
      SafeSubscriber.prototype._unsubscribe = function () {
          var _parentSubscriber = this._parentSubscriber;
          this._context = null;
          this._parentSubscriber = null;
          _parentSubscriber.unsubscribe();
      };
      return SafeSubscriber;
  }(Subscriber));

  var ReplaySubject = (function (bufferSize, windowTime) {
      if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
      if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
      return sourceAsSubject(replaySubjectSource(bufferSize, windowTime));
  });
  function replaySubjectSource(bufferSize, windowTime) {
      if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
      if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
      var _base = subjectBaseSource();
      var _buffer = [];
      var _endType;
      var _endArg;
      return (function (type, arg, subs) {
          _base(type, arg, subs);
          var now = Date.now();
          for (var i = 0; i < _buffer.length; i++) {
              var _a = _buffer[i], a = _a.arg, timeout = _a.timeout;
              if (timeout < now) {
                  _buffer.splice(i);
                  break;
              }
              if (type === exports.FOType.SUBSCRIBE) {
                  arg(exports.FOType.NEXT, a, subs);
              }
          }
          if (_endType) {
              if (type === exports.FOType.SUBSCRIBE) {
                  arg(_endType, _endArg, subs);
                  subs.unsubscribe();
              }
              return;
          }
          switch (type) {
              case exports.FOType.NEXT:
                  _buffer.push({ arg: arg, timeout: now + windowTime });
                  if (_buffer.length > bufferSize) {
                      _buffer.splice(0, _buffer.length - bufferSize);
                  }
                  break;
              case exports.FOType.ERROR:
                  _endType = exports.FOType.ERROR;
                  _endArg = arg;
                  break;
              case exports.FOType.COMPLETE:
                  _endType = exports.FOType.COMPLETE;
                  break;
              default:
                  break;
          }
      });
  }

  var NEVER = sourceAsObservable(function () { });

  function isArrayLike(obj) {
      return obj != null && typeof obj !== 'function' && typeof obj.length === 'number';
  }

  function isPromiseLike(obj) {
      return obj != null && typeof obj.then === 'function';
  }

  function isIterable(obj) {
      return typeof obj[Symbol.iterator] === 'function';
  }

  var symbolObservable = Symbol && Symbol.observable || '@@observable';

  function isInteropObservable(obj) {
      return typeof obj[symbolObservable] === 'function';
  }

  var symbolAsyncIterator = (Symbol && Symbol.asyncIterator) || '@@asyncIterator';

  function isAsyncIterable(obj) {
      return typeof obj[symbolAsyncIterator] === 'function';
  }

  function isObservable(obj) {
      return typeof obj === 'function' && typeof obj.subscribe === 'function' && typeof obj.toPromise === 'function';
  }

  function asyncIterableSource(input) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var ai_1 = input[symbolAsyncIterator]();
              var getNextValue_1;
              getNextValue_1 = function () { return ai_1.next().then(function (result) {
                  if (result.done) {
                      sink(exports.FOType.COMPLETE, undefined, subs);
                  }
                  else {
                      sink(exports.FOType.NEXT, result.value, subs);
                      getNextValue_1();
                  }
              }, function (err) {
                  sink(exports.FOType.ERROR, err, subs);
              }); };
              getNextValue_1();
          }
      };
  }

  function symbolObservableSource(input) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var obs = input[symbolObservable]();
              if (!obs) {
                  sink(exports.FOType.ERROR, new Error('invalid Symbol.observable implementation, observable not returned'), subs);
              }
              if (typeof obs.subscribe !== 'function') {
                  sink(exports.FOType.ERROR, new Error('invalid Symbol.observable implementation, no subscribe method on returned value'), subs);
                  return;
              }
              var subscription_1;
              subs.add(function () {
                  if (subscription_1 && typeof subscription_1.unsubscribe === 'function') {
                      subscription_1.unsubscribe();
                  }
              });
              subscription_1 = obs.subscribe({
                  next: function (value) { sink(exports.FOType.NEXT, value, subs); },
                  error: function (err) { sink(exports.FOType.ERROR, err, subs); },
                  complete: function () { sink(exports.FOType.COMPLETE, undefined, subs); }
              });
          }
      };
  }

  function iterableSource(iterable) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var iterator = iterable[Symbol.iterator]();
              while (true) {
                  if (subs.closed)
                      return;
                  var _a = iterator.next(), done = _a.done, value = _a.value;
                  if (done)
                      break;
                  sink(exports.FOType.NEXT, value, subs);
              }
              sink(exports.FOType.COMPLETE, undefined, subs);
          }
      };
  }

  function promiseSource(promise) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              promise.then(function (value) {
                  if (!subs.closed) {
                      sink(exports.FOType.NEXT, value, subs);
                      sink(exports.FOType.COMPLETE, undefined, subs);
                  }
              }, function (err) {
                  if (!subs.closed) {
                      sink(exports.FOType.ERROR, err, subs);
                  }
              });
          }
      };
  }

  function fromSource(input) {
      if (isObservable(input)) {
          return input;
      }
      else if (isPromiseLike(input)) {
          return promiseSource(input);
      }
      else if (isArrayLike(input)) {
          return ofSource(input);
      }
      else if (isIterable(input)) {
          return iterableSource(input);
      }
      else if (isInteropObservable(input)) {
          return symbolObservableSource(input);
      }
      else if (isAsyncIterable(input)) {
          return asyncIterableSource(input);
      }
      throw new Error('Unable to convert from input to Observable source');
  }

  /* tslint:enable:max-line-length */
  function combineLatest() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      if (sources && sources.length === 1 && Array.isArray(sources[0])) {
          sources = sources[0];
      }
      return sourceAsObservable(combineLatestSource(sources));
  }
  function combineLatestSource(sources) {
      return function (type, dest, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var values_1 = new Array(sources.length);
              var emittedOnce_1 = sources.map(function () { return false; });
              var completed_1 = sources.map(function () { return false; });
              var hasValues_1 = false;
              var _loop_1 = function (s) {
                  var source = sources[s];
                  var src = tryUserFunction(fromSource, source);
                  if (resultIsError(src)) {
                      dest(exports.FOType.ERROR, src.error, subs);
                      return { value: void 0 };
                  }
                  src(exports.FOType.SUBSCRIBE, function (t, v, subs) {
                      switch (t) {
                          case exports.FOType.NEXT:
                              values_1[s] = v;
                              emittedOnce_1[s] = true;
                              if (hasValues_1 || (hasValues_1 = emittedOnce_1.every(identity))) {
                                  dest(exports.FOType.NEXT, values_1.slice(0), subs);
                              }
                              break;
                          case exports.FOType.ERROR:
                              dest(t, v, subs);
                              break;
                          case exports.FOType.COMPLETE:
                              completed_1[s] = true;
                              if (completed_1.every(identity)) {
                                  dest(exports.FOType.COMPLETE, undefined, subs);
                              }
                              break;
                          default:
                              break;
                      }
                  }, subs);
              };
              for (var s = 0; s < sources.length; s++) {
                  var state_1 = _loop_1(s);
                  if (typeof state_1 === "object")
                      return state_1.value;
              }
          }
      };
  }

  function lift(operatorDef) {
      return function (source) {
          return sourceAsObservable(function (type, dest, subs) {
              if (type === exports.FOType.SUBSCRIBE) {
                  operatorDef(source, dest, subs);
              }
          });
      };
  }

  function mergeMap(project, concurrent) {
      if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
      return lift(function (source, dest, subs) {
          var counter = 0;
          var active = 0;
          var outerComplete = false;
          var buffer = [];
          var startNextInner;
          startNextInner = function () {
              var _loop_1 = function () {
                  active++;
                  var _a = buffer.shift(), outerValue = _a.outerValue, outerIndex = _a.outerIndex;
                  var innerSource = tryUserFunction(function () { return fromSource(project(outerValue, outerIndex)); });
                  if (resultIsError(innerSource)) {
                      dest(exports.FOType.ERROR, innerSource.error, subs);
                      subs.unsubscribe();
                      return { value: void 0 };
                  }
                  var innerSubs = new Subscription();
                  subs.add(innerSubs);
                  // INNER subscription
                  innerSource(exports.FOType.SUBSCRIBE, function (type, v, innerSubs) {
                      switch (type) {
                          case exports.FOType.NEXT:
                              dest(exports.FOType.NEXT, v, subs);
                              break;
                          case exports.FOType.ERROR:
                              dest(exports.FOType.ERROR, v, subs);
                              subs.unsubscribe();
                              break;
                          case exports.FOType.COMPLETE:
                              subs.remove(innerSubs);
                              active--;
                              if (buffer.length > 0) {
                                  startNextInner();
                              }
                              if (outerComplete && buffer.length == 0 && active === 0) {
                                  dest(exports.FOType.COMPLETE, undefined, subs);
                              }
                          default:
                      }
                  }, innerSubs);
              };
              while (buffer.length > 0 && active < concurrent) {
                  var state_1 = _loop_1();
                  if (typeof state_1 === "object")
                      return state_1.value;
              }
          };
          // OUTER subscription
          source(exports.FOType.SUBSCRIBE, function (t, v) {
              switch (t) {
                  case exports.FOType.NEXT:
                      var outerIndex = counter++;
                      buffer.push({ outerValue: v, outerIndex: outerIndex });
                      startNextInner();
                      break;
                  case exports.FOType.ERROR:
                      if (!subs.closed) {
                          dest(exports.FOType.ERROR, v, subs);
                          subs.unsubscribe();
                      }
                      break;
                  case exports.FOType.COMPLETE:
                      outerComplete = true;
                      if (buffer.length > 0) {
                          startNextInner();
                      }
                      else if (active === 0) {
                          dest(exports.FOType.COMPLETE, undefined, subs);
                      }
                      break;
                  default:
              }
          }, subs);
      });
  }

  var mergeAll = function (concurrent) {
      if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
      return mergeMap(identity, concurrent);
  };

  var concatAll = function () { return mergeAll(1); };

  function concat() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      return of.apply(void 0, sources).pipe(concatAll());
  }

  function defer(fn) {
      return sourceAsObservable(deferSource(fn));
  }
  function deferSource(fn) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var result = tryUserFunction(function () { return fromSource(fn()); });
              if (resultIsError(result)) {
                  sink(exports.FOType.ERROR, result.error, subs);
                  return;
              }
              result(exports.FOType.SUBSCRIBE, sink, subs);
          }
      };
  }

  /* tslint:enable:max-line-length */
  /**
   * Joins last values emitted by passed Observables.
   *
   * <span class="informal">Wait for Observables to complete and then combine last values they emitted.</span>
   *
   * ![](forkJoin.png)
   *
   * `forkJoin` is an operator that takes any number of Observables which can be passed either as an array
   * or directly as arguments. If no input Observables are provided, resulting stream will complete
   * immediately.
   *
   * `forkJoin` will wait for all passed Observables to complete and then it will emit an array with last
   * values from corresponding Observables. So if you pass `n` Observables to the operator, resulting
   * array will have `n` values, where first value is the last thing emitted by the first Observable,
   * second value is the last thing emitted by the second Observable and so on. That means `forkJoin` will
   * not emit more than once and it will complete after that. If you need to emit combined values not only
   * at the end of lifecycle of passed Observables, but also throughout it, try out {@link combineLatest}
   * or {@link zip} instead.
   *
   * In order for resulting array to have the same length as the number of input Observables, whenever any of
   * that Observables completes without emitting any value, `forkJoin` will complete at that moment as well
   * and it will not emit anything either, even if it already has some last values from other Observables.
   * Conversely, if there is an Observable that never completes, `forkJoin` will never complete as well,
   * unless at any point some other Observable completes without emitting value, which brings us back to
   * the previous case. Overall, in order for `forkJoin` to emit a value, all Observables passed as arguments
   * have to emit something at least once and complete.
   *
   * If any input Observable errors at some point, `forkJoin` will error as well and all other Observables
   * will be immediately unsubscribed.
   *
   * Optionally `forkJoin` accepts project function, that will be called with values which normally
   * would land in emitted array. Whatever is returned by project function, will appear in output
   * Observable instead. This means that default project can be thought of as a function that takes
   * all its arguments and puts them into an array. Note that project function will be called only
   * when output Observable is supposed to emit a result.
   *
   * ## Examples
   * ### Use forkJoin with operator emitting immediately
   * ```javascript
   * import { forkJoin, of } from 'rxjs';
   *
   * const observable = forkJoin(
   *   of(1, 2, 3, 4),
   *   of(5, 6, 7, 8),
   * );
   * observable.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('This is how it ends!'),
   * );
   *
   * // Logs:
   * // [4, 8]
   * // "This is how it ends!"
   * ```
   *
   * ### Use forkJoin with operator emitting after some time
   * ```javascript
   * import { forkJoin, interval } from 'rxjs';
   * import { take } from 'rxjs/operators';
   *
   * const observable = forkJoin(
   *   interval(1000).pipe(take(3)), // emit 0, 1, 2 every second and complete
   *   interval(500).pipe(take(4)),  // emit 0, 1, 2, 3 every half a second and complete
   * );
   * observable.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('This is how it ends!'),
   * );
   *
   * // Logs:
   * // [2, 3] after 3 seconds
   * // "This is how it ends!" immediately after
   * ```
   *
   * ### Use forkJoin with project function
   * ```javascript
   * import { forkJoin, interval } from 'rxjs';
   * import { take } from 'rxjs/operators';
   *
   * const observable = forkJoin(
   *   interval(1000).pipe(take(3)), // emit 0, 1, 2 every second and complete
   *   interval(500).pipe(take(4)),  // emit 0, 1, 2, 3 every half a second and complete
   * ).pipe(
   *   map(([n, m]) => n + m),
   * );
   * observable.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('This is how it ends!'),
   * );
   *
   * // Logs:
   * // 5 after 3 seconds
   * // "This is how it ends!" immediately after
   * ```
   *
   * @see {@link combineLatest}
   * @see {@link zip}
   *
   * @param {...ObservableInput} sources Any number of Observables provided either as an array or as an arguments
   * passed directly to the operator.
   * @return {Observable} Observable emitting either an array of last values emitted by passed Observables
   * or value from project function.
   */
  function forkJoin() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      if (sources.length === 0) {
          return EMPTY;
      }
      if (sources.length === 1 && Array.isArray(sources[0])) {
          return forkJoin.apply(void 0, sources[0]);
      }
      var validSources = sources;
      return sourceAsObservable(function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var state_1 = validSources.map(toEmptyState);
              var _loop_1 = function (i) {
                  var source = tryUserFunction(fromSource, validSources[i]);
                  if (resultIsError(source)) {
                      sink(exports.FOType.ERROR, source.error, subs);
                  }
                  else {
                      source(exports.FOType.SUBSCRIBE, function (t, v, subs) {
                          var s = state_1[i];
                          if (t === exports.FOType.NEXT) {
                              s.hasValue = true;
                              s.value = v;
                          }
                          else if (t === exports.FOType.COMPLETE) {
                              s.completed = true;
                              if (!s.hasValue || state_1.every(isComplete)) {
                                  if (state_1.every(hasValue)) {
                                      sink(exports.FOType.NEXT, state_1.map(getValue), subs);
                                  }
                                  sink(exports.FOType.COMPLETE, undefined, subs);
                              }
                          }
                          else if (t === exports.FOType.ERROR) {
                              sink(exports.FOType.ERROR, v, subs);
                          }
                      }, subs);
                  }
              };
              for (var i = 0; i < validSources.length && !subs.closed; i++) {
                  _loop_1(i);
              }
          }
      });
  }
  function toEmptyState() {
      return {
          hasValue: false,
          completed: false,
          value: undefined
      };
  }
  function isComplete(s) {
      return s.completed;
  }
  function hasValue(s) {
      return s.hasValue;
  }
  function getValue(o) {
      return o.value;
  }

  function from(input) {
      return sourceAsObservable(fromSource(input));
  }

  /* tslint:enable:max-line-length */
  /**
   * Creates an Observable that emits events of a specific type coming from the
   * given event target.
   *
   * <span class="informal">Creates an Observable from DOM events, or Node.js
   * EventEmitter events or others.</span>
   *
   * ![](fromEvent.png)
   *
   * `fromEvent` accepts as a first argument event target, which is an object with methods
   * for registering event handler functions. As a second argument it takes string that indicates
   * type of event we want to listen for. `fromEvent` supports selected types of event targets,
   * which are described in detail below. If your event target does not match any of the ones listed,
   * you should use {@link fromEventPattern}, which can be used on arbitrary APIs.
   * When it comes to APIs supported by `fromEvent`, their methods for adding and removing event
   * handler functions have different names, but they all accept a string describing event type
   * and function itself, which will be called whenever said event happens.
   *
   * Every time resulting Observable is subscribed, event handler function will be registered
   * to event target on given event type. When that event fires, value
   * passed as a first argument to registered function will be emitted by output Observable.
   * When Observable is unsubscribed, function will be unregistered from event target.
   *
   * Note that if event target calls registered function with more than one argument, second
   * and following arguments will not appear in resulting stream. In order to get access to them,
   * you can pass to `fromEvent` optional project function, which will be called with all arguments
   * passed to event handler. Output Observable will then emit value returned by project function,
   * instead of the usual value.
   *
   * Remember that event targets listed below are checked via duck typing. It means that
   * no matter what kind of object you have and no matter what environment you work in,
   * you can safely use `fromEvent` on that object if it exposes described methods (provided
   * of course they behave as was described above). So for example if Node.js library exposes
   * event target which has the same method names as DOM EventTarget, `fromEvent` is still
   * a good choice.
   *
   * If the API you use is more callback then event handler oriented (subscribed
   * callback function fires only once and thus there is no need to manually
   * unregister it), you should use {@link bindCallback} or {@link bindNodeCallback}
   * instead.
   *
   * `fromEvent` supports following types of event targets:
   *
   * **DOM EventTarget**
   *
   * This is an object with `addEventListener` and `removeEventListener` methods.
   *
   * In the browser, `addEventListener` accepts - apart from event type string and event
   * handler function arguments - optional third parameter, which is either an object or boolean,
   * both used for additional configuration how and when passed function will be called. When
   * `fromEvent` is used with event target of that type, you can provide this values
   * as third parameter as well.
   *
   * **Node.js EventEmitter**
   *
   * An object with `addListener` and `removeListener` methods.
   *
   * **JQuery-style event target**
   *
   * An object with `on` and `off` methods
   *
   * **DOM NodeList**
   *
   * List of DOM Nodes, returned for example by `document.querySelectorAll` or `Node.childNodes`.
   *
   * Although this collection is not event target in itself, `fromEvent` will iterate over all Nodes
   * it contains and install event handler function in every of them. When returned Observable
   * is unsubscribed, function will be removed from all Nodes.
   *
   * **DOM HtmlCollection**
   *
   * Just as in case of NodeList it is a collection of DOM nodes. Here as well event handler function is
   * installed and removed in each of elements.
   *
   *
   * ## Examples
   * ### Emits clicks happening on the DOM document
   * ```javascript
   * const clicks = fromEvent(document, 'click');
   * clicks.subscribe(x => console.log(x));
   *
   * // Results in:
   * // MouseEvent object logged to console every time a click
   * // occurs on the document.
   * ```
   *
   * ### Use addEventListener with capture option
   * ```javascript
   * const clicksInDocument = fromEvent(document, 'click', true); // note optional configuration parameter
   *                                                              // which will be passed to addEventListener
   * const clicksInDiv = fromEvent(someDivInDocument, 'click');
   *
   * clicksInDocument.subscribe(() => console.log('document'));
   * clicksInDiv.subscribe(() => console.log('div'));
   *
   * // By default events bubble UP in DOM tree, so normally
   * // when we would click on div in document
   * // "div" would be logged first and then "document".
   * // Since we specified optional `capture` option, document
   * // will catch event when it goes DOWN DOM tree, so console
   * // will log "document" and then "div".
   * ```
   *
   * @see {@link bindCallback}
   * @see {@link bindNodeCallback}
   * @see {@link fromEventPattern}
   *
   * @param {FromEventTarget<T>} target The DOM EventTarget, Node.js
   * EventEmitter, JQuery-like event target, NodeList or HTMLCollection to attach the event handler to.
   * @param {string} eventName The event name of interest, being emitted by the
   * `target`.
   * @param {EventListenerOptions} [options] Options to pass through to addEventListener
   * @return {Observable<T>}
   * @name fromEvent
   */
  function fromEvent(target, eventName, options) {
      return sourceAsObservable(function (type, sink, subs) {
          function handler(e) {
              var arg = arguments.length > 1 ? Array.from(arguments) : e;
              sink(exports.FOType.NEXT, arg, subs);
          }
          setupSubscription(target, eventName, handler, subs, sink, options);
      });
  }
  function setupSubscription(sourceObj, eventName, handler, subs, sink, options) {
      var unsubscribe;
      if (isEventTarget(sourceObj)) {
          var source_1 = sourceObj;
          sourceObj.addEventListener(eventName, handler, options);
          unsubscribe = function () { return source_1.removeEventListener(eventName, handler, options); };
      }
      else if (isJQueryStyleEventEmitter(sourceObj)) {
          var source_2 = sourceObj;
          sourceObj.on(eventName, handler);
          unsubscribe = function () { return source_2.off(eventName, handler); };
      }
      else if (isNodeStyleEventEmitter(sourceObj)) {
          var source_3 = sourceObj;
          sourceObj.addListener(eventName, handler);
          unsubscribe = function () { return source_3.removeListener(eventName, handler); };
      }
      else if (sourceObj && sourceObj.length) {
          for (var i = 0, len = sourceObj.length; i < len; i++) {
              setupSubscription(sourceObj[i], eventName, handler, subs, sink, options);
          }
      }
      else {
          sink(exports.FOType.ERROR, new TypeError('Invalid event target'), subs);
          return;
      }
      subs.add(unsubscribe);
  }
  function isNodeStyleEventEmitter(sourceObj) {
      return sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
  }
  function isJQueryStyleEventEmitter(sourceObj) {
      return sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
  }
  function isEventTarget(sourceObj) {
      return sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
  }

  /**
   * Creates an Observable from an arbitrary API for registering event handlers.
   *
   * <span class="informal">When that method for adding event handler was something {@link fromEvent}
   * was not prepared for.</span>
   *
   * ![](fromEventPattern.png)
   *
   * `fromEventPattern` allows you to convert into an Observable any API that supports registering handler functions
   * for events. It is similar to {@link fromEvent}, but far
   * more flexible. In fact, all use cases of {@link fromEvent} could be easily handled by
   * `fromEventPattern` (although in slightly more verbose way).
   *
   * This operator accepts as a first argument an `addHandler` function, which will be injected with
   * handler parameter. That handler is actually an event handler function that you now can pass
   * to API expecting it. `addHandler` will be called whenever Observable
   * returned by the operator is subscribed, so registering handler in API will not
   * necessarily happen when `fromEventPattern` is called.
   *
   * After registration, every time an event that we listen to happens,
   * Observable returned by `fromEventPattern` will emit value that event handler
   * function was called with. Note that if event handler was called with more
   * then one argument, second and following arguments will not appear in the Observable.
   *
   * If API you are using allows to unregister event handlers as well, you can pass to `fromEventPattern`
   * another function - `removeHandler` - as a second parameter. It will be injected
   * with the same handler function as before, which now you can use to unregister
   * it from the API. `removeHandler` will be called when consumer of resulting Observable
   * unsubscribes from it.
   *
   * In some APIs unregistering is actually handled differently. Method registering an event handler
   * returns some kind of token, which is later used to identify which function should
   * be unregistered or it itself has method that unregisters event handler.
   * If that is the case with your API, make sure token returned
   * by registering method is returned by `addHandler`. Then it will be passed
   * as a second argument to `removeHandler`, where you will be able to use it.
   *
   * If you need access to all event handler parameters (not only the first one),
   * or you need to transform them in any way, you can call `fromEventPattern` with optional
   * third parameter - project function which will accept all arguments passed to
   * event handler when it is called. Whatever is returned from project function will appear on
   * resulting stream instead of usual event handlers first argument. This means
   * that default project can be thought of as function that takes its first parameter
   * and ignores the rest.
   *
   * ## Example
   * ### Emits clicks happening on the DOM document
   *
   * ```javascript
   * function addClickHandler(handler) {
   *   document.addEventListener('click', handler);
   * }
   *
   * function removeClickHandler(handler) {
   *   document.removeEventListener('click', handler);
   * }
   *
   * const clicks = fromEventPattern(
   *   addClickHandler,
   *   removeClickHandler
   * );
   * clicks.subscribe(x => console.log(x));
   *
   * // Whenever you click anywhere in the browser, DOM MouseEvent
   * // object will be logged.
   * ```
   *
   * ## Example
   * ### Use with API that returns cancellation token
   *
   * ```javascript
   * const token = someAPI.registerEventHandler(function() {});
   * someAPI.unregisterEventHandler(token); // this APIs cancellation method accepts
   *                                        // not handler itself, but special token.
   *
   * const someAPIObservable = fromEventPattern(
   *   function(handler) { return someAPI.registerEventHandler(handler); }, // Note that we return the token here...
   *   function(handler, token) { someAPI.unregisterEventHandler(token); }  // ...to then use it here.
   * );
   * ```
   *
   * ## Example
   * ### Use with project function
   *
   * ```javascript
   * someAPI.registerEventHandler((eventType, eventMessage) => {
   *   console.log(eventType, eventMessage); // Logs "EVENT_TYPE" "EVENT_MESSAGE" to console.
   * });
   *
   * const someAPIObservable = fromEventPattern(
   *   handler => someAPI.registerEventHandler(handler),
   *   handler => someAPI.unregisterEventHandler(handler)
   *   (eventType, eventMessage) => eventType + " --- " + eventMessage // without that function only "EVENT_TYPE"
   * );                                                                // would be emitted by the Observable
   *
   * someAPIObservable.subscribe(value => console.log(value));
   *
   * // Logs:
   * // "EVENT_TYPE --- EVENT_MESSAGE"
   * ```
   *
   * @see {@link fromEvent}
   * @see {@link bindCallback}
   * @see {@link bindNodeCallback}
   *
   * @param {function(handler: Function): any} addHandler A function that takes
   * a `handler` function as argument and attaches it somehow to the actual
   * source of events.
   * @param {function(handler: Function, token?: any): void} [removeHandler] A function that
   * takes a `handler` function as an argument and removes it from the event source. If `addHandler`
   * returns some kind of token, `removeHandler` function will have it as a second parameter.
   * @param {function(...args: any): T} [project] A function to
   * transform results. It takes the arguments from the event handler and
   * should return a single value.
   * @return {Observable<T>} Observable which, when an event happens, emits first parameter
   * passed to registered event handler. Alternatively it emits whatever project function returns
   * at that moment.
   * @static true
   * @name fromEventPattern
   * @owner Observable
   */
  function fromEventPattern(addHandler, removeHandler) {
      return sourceAsObservable(function (type, sink, subs) {
          var handler = function () {
              var e = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  e[_i] = arguments[_i];
              }
              return sink(exports.FOType.NEXT, e.length === 1 ? e[0] : e, subs);
          };
          var retValue = tryUserFunction(addHandler, handler);
          if (resultIsError(retValue)) {
              sink(exports.FOType.ERROR, retValue.error, subs);
              return;
          }
          if (typeof removeHandler !== 'function') {
              return;
          }
          subs.add(function () { return removeHandler(handler, retValue); });
      });
  }

  // TODO: require rxjs/core as a peer dep
  function fromScheduled(input, scheduler) {
      if (isObservable(input)) {
          return sourceAsObservable(fromObservableScheduledSource(input, scheduler));
      }
      else if (isInteropObservable(input)) {
          return sourceAsObservable(fromInteropObservableSource(input, scheduler));
      }
      else if (isPromiseLike(input)) {
          return sourceAsObservable(fromPromiseLikeSource(input, scheduler));
      }
      else if (isAsyncIterable(input)) {
          return sourceAsObservable(fromAsyncIterableSource(input, scheduler));
      }
      else if (isIterable(input)) {
          return sourceAsObservable(fromIterableScheduledSource(input, scheduler));
      }
      else if (isArrayLike(input)) {
          return sourceAsObservable(fromArrayLikeScheduledSource(input, scheduler));
      }
      else {
          throw new Error('not implemented yet');
      }
  }
  // TODO: this could be refactored with subscribeOn and observeOn (perhaps "scheduleOn")?
  function fromObservableScheduledSource(input, scheduler) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              scheduler.schedule(function () {
                  input(exports.FOType.SUBSCRIBE, function (t, a, subs) {
                      scheduler.schedule(function () {
                          sink(t, a, subs);
                      }, 0, null, subs);
                  }, subs);
              }, 0, null, subs);
          }
      };
  }
  function fromInteropObservableSource(input, scheduler) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              scheduler.schedule(function () {
                  var source = input[Symbol.observable]();
                  var innerSubs = source.subscribe({
                      next: function (value) {
                          scheduler.schedule(function () { return sink(exports.FOType.NEXT, value, subs); }, 0, null, subs);
                      },
                      error: function (err) {
                          scheduler.schedule(function () {
                              sink(exports.FOType.ERROR, err, subs);
                          }, 0, null, subs);
                      },
                      complete: function () {
                          scheduler.schedule(function () {
                              sink(exports.FOType.COMPLETE, undefined, subs);
                          }, 0, null, subs);
                      }
                  });
                  subs.add(innerSubs);
              }, 0, null, subs);
          }
      };
  }
  function fromPromiseLikeSource(input, scheduler) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              scheduler.schedule(function () {
                  input.then(function (value) {
                      scheduler.schedule(function () {
                          sink(exports.FOType.NEXT, value, subs);
                          scheduler.schedule(function () { return sink(exports.FOType.COMPLETE, undefined, subs); }, 0, null, subs);
                      }, 0, null, subs);
                  }, function (err) {
                      scheduler.schedule(function () { return sink(exports.FOType.ERROR, err, subs); }, 0, null, subs);
                  });
              }, 0, null, subs);
          }
      };
  }
  function fromAsyncIterableSource(input, scheduler) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              scheduler.schedule(function () {
                  var ai = input[symbolAsyncIterator]();
                  var go = function () { return scheduler.schedule(function () {
                      ai.next().then(function (result) {
                          var done = result.done, value = result.value;
                          if (done) {
                              scheduler.schedule(function () { return sink(exports.FOType.COMPLETE, undefined, subs); }, 0, null, subs);
                          }
                          else {
                              scheduler.schedule(function () { return sink(exports.FOType.NEXT, value, subs); }, 0, null, subs);
                              go();
                          }
                      }, function (err) {
                          scheduler.schedule(function () { return sink(exports.FOType.ERROR, err, subs); }, 0, null, subs);
                      });
                  }, 0, null, subs); };
                  go();
              }, 0, null, subs);
          }
      };
  }
  function fromArrayLikeScheduledSource(input, scheduler) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var i = 0;
              scheduler.schedule(fromArrayLikeWork, 0, { i: i, input: input, subs: subs, sink: sink, scheduler: scheduler }, subs);
          }
      };
  }
  function fromArrayLikeWork(state) {
      var i = state.i, input = state.input, subs = state.subs, sink = state.sink, scheduler = state.scheduler;
      if (subs.closed)
          return;
      if (i < input.length) {
          if (i < input.length) {
              sink(exports.FOType.NEXT, input[state.i++], subs);
              if (subs.closed)
                  return;
              scheduler.schedule(fromArrayLikeWork, 0, state, subs);
          }
          else {
              sink(exports.FOType.COMPLETE, undefined, subs);
          }
      }
  }
  function fromIterableScheduledSource(input, scheduler) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var iterator = input[Symbol.iterator]();
              scheduler.schedule(fromIterableWork, 0, { iterator: iterator, subs: subs, sink: sink, scheduler: scheduler }, subs);
          }
      };
  }
  function fromIterableWork(state) {
      var iterator = state.iterator, subs = state.subs, sink = state.sink, scheduler = state.scheduler;
      if (subs.closed)
          return;
      var _a = iterator.next(), done = _a.done, value = _a.value;
      if (done) {
          sink(exports.FOType.COMPLETE, undefined, subs);
      }
      else {
          sink(exports.FOType.NEXT, value, subs);
          scheduler.schedule(fromIterableWork, 0, state, subs);
      }
  }

  /**
   * Decides at subscription time which Observable will actually be subscribed.
   *
   * <span class="informal">`If` statement for Observables.</span>
   *
   * `iif` accepts a condition function and two Observables. When
   * an Observable returned by the operator is subscribed, condition function will be called.
   * Based on what boolean it returns at that moment, consumer will subscribe either to
   * the first Observable (if condition was true) or to the second (if condition was false). Condition
   * function may also not return anything - in that case condition will be evaluated as false and
   * second Observable will be subscribed.
   *
   * Note that Observables for both cases (true and false) are optional. If condition points to an Observable that
   * was left undefined, resulting stream will simply complete immediately. That allows you to, rather
   * then controlling which Observable will be subscribed, decide at runtime if consumer should have access
   * to given Observable or not.
   *
   * If you have more complex logic that requires decision between more than two Observables, {@link defer}
   * will probably be a better choice. Actually `iif` can be easily implemented with {@link defer}
   * and exists only for convenience and readability reasons.
   *
   *
   * ## Examples
   * ### Change at runtime which Observable will be subscribed
   * ```javascript
   * let subscribeToFirst;
   * const firstOrSecond = iif(
   *   () => subscribeToFirst,
   *   of('first'),
   *   of('second'),
   * );
   *
   * subscribeToFirst = true;
   * firstOrSecond.subscribe(value => console.log(value));
   *
   * // Logs:
   * // "first"
   *
   * subscribeToFirst = false;
   * firstOrSecond.subscribe(value => console.log(value));
   *
   * // Logs:
   * // "second"
   *
   * ```
   *
   * ### Control an access to an Observable
   * ```javascript
   * let accessGranted;
   * const observableIfYouHaveAccess = iif(
   *   () => accessGranted,
   *   of('It seems you have an access...'), // Note that only one Observable is passed to the operator.
   * );
   *
   * accessGranted = true;
   * observableIfYouHaveAccess.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('The end'),
   * );
   *
   * // Logs:
   * // "It seems you have an access..."
   * // "The end"
   *
   * accessGranted = false;
   * observableIfYouHaveAccess.subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('The end'),
   * );
   *
   * // Logs:
   * // "The end"
   * ```
   *
   * @see {@link defer}
   *
   * @param {function(): boolean} condition Condition which Observable should be chosen.
   * @param {Observable} [trueObservable] An Observable that will be subscribed if condition is true.
   * @param {Observable} [falseObservable] An Observable that will be subscribed if condition is false.
   * @return {Observable} Either first or second Observable, depending on condition.
   * @static true
   * @name iif
   * @owner Observable
   */
  function iif(condition, trueResult, falseResult) {
      if (trueResult === void 0) { trueResult = EMPTY; }
      if (falseResult === void 0) { falseResult = EMPTY; }
      return defer(function () { return condition() ? trueResult : falseResult; });
  }

  var asyncScheduler = {
      now: function () {
          return Date.now();
      },
      schedule: function (work, delay, state, subs) {
          if (delay === void 0) { delay = 0; }
          if (state === void 0) { state = undefined; }
          subs = subs || new Subscription();
          var id = setTimeout(function () { return work(state); }, delay);
          subs.add(function () { return clearTimeout(id); });
          return subs;
      }
  };

  function interval(interval, scheduler) {
      if (scheduler === void 0) { scheduler = asyncScheduler; }
      interval = Math.max(0, interval);
      return sourceAsObservable(function (type, dest, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var state = { i: 0, subs: subs, interval: interval, dest: dest, scheduler: scheduler };
              scheduler.schedule(intervalWork, interval, state, subs);
          }
      });
  }
  function intervalWork(state) {
      var subs = state.subs, dest = state.dest, interval = state.interval, scheduler = state.scheduler;
      if (!subs.closed) {
          dest(exports.FOType.NEXT, state.i++, subs);
          scheduler.schedule(intervalWork, interval, state, subs);
      }
  }

  function merge() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      return of.apply(void 0, sources).pipe(mergeAll());
  }

  function isObserver(obj) {
      return obj != null &&
          typeof obj.next === 'function' &&
          typeof obj.error === 'function' &&
          typeof obj.complete === 'function';
  }

  function multicast(source, subjectOrFactory) {
      var subjectFactory = isObserver(subjectOrFactory) ? function () { return subjectOrFactory; } : subjectOrFactory;
      return new ConnectableObservable(source, subjectFactory);
  }

  var RecyclableSubscription = function RecyclableSubscription() {
      var teardowns = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          teardowns[_i] = arguments[_i];
      }
      Subscription.apply(this, teardowns);
  };
  RecyclableSubscription.prototype = Object.create(Subscription.prototype);
  RecyclableSubscription.prototype.recycle = function () {
      var _teardowns = this._teardowns;
      while (_teardowns.length > 0) {
          teardownToFunction(_teardowns.shift())();
      }
  };

  function onEmptyResumeNext() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      return sourceAsObservable(function (type, dest, downstreamSubs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var remainingSources_1 = sources.slice();
              var hasValue_1 = false;
              var upstreamSubs_1 = new RecyclableSubscription();
              downstreamSubs.add(upstreamSubs_1);
              var subscribe_1;
              subscribe_1 = function () {
                  var source = remainingSources_1.shift();
                  hasValue_1 = false;
                  source(exports.FOType.SUBSCRIBE, function (t, v, _) {
                      hasValue_1 = hasValue_1 || t === exports.FOType.NEXT;
                      if (t === exports.FOType.COMPLETE && !hasValue_1) {
                          upstreamSubs_1.recycle();
                          subscribe_1();
                      }
                      else {
                          dest(t, v, downstreamSubs);
                      }
                  }, upstreamSubs_1);
              };
              subscribe_1();
          }
      });
  }

  function onErrorResumeNext() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      if (sources.length === 1 && Array.isArray(sources[0])) {
          return onErrorResumeNext.apply(void 0, sources[0]);
      }
      return sourceAsObservable(function (type, dest, downstreamSubs) {
          var remainingSources = sources.slice();
          var upstreamSubs = new RecyclableSubscription();
          downstreamSubs.add(upstreamSubs);
          var subscribe;
          subscribe = function () {
              var input = remainingSources.shift();
              var source = tryUserFunction(fromSource, input);
              if (resultIsError(source)) {
                  upstreamSubs.recycle();
                  subscribe();
                  return;
              }
              source(exports.FOType.SUBSCRIBE, function (t, v, _) {
                  if (t === exports.FOType.ERROR && remainingSources.length > 0) {
                      upstreamSubs.recycle();
                      subscribe();
                  }
                  else {
                      if (t === exports.FOType.ERROR) {
                          t = exports.FOType.COMPLETE;
                      }
                      dest(t, v, downstreamSubs);
                  }
              }, upstreamSubs);
          };
          subscribe();
      });
  }

  function filter(predicate) {
      return lift(function (source, dest, subs) {
          var i = 0;
          source(exports.FOType.SUBSCRIBE, function (t, v, subs) {
              if (t === exports.FOType.NEXT) {
                  var result = tryUserFunction(predicate, v, i++);
                  if (resultIsError(result)) {
                      dest(exports.FOType.ERROR, result.error, subs);
                      subs.unsubscribe();
                      return;
                  }
                  if (!result)
                      return;
              }
              dest(t, v, subs);
          }, subs);
      });
  }

  function partition(source, predicate) {
      return [
          source.pipe(filter(predicate)),
          source.pipe(filter(function (v, i) { return !predicate(v, i); })),
      ];
  }

  /**
   * Convert an object into an Observable of `[key, value]` pairs.
   *
   * <span class="informal">Turn entries of an object into a stream.</span>
   *
   * <img src="./img/pairs.png" width="100%">
   *
   * `pairs` takes an arbitrary object and returns an Observable that emits arrays. Each
   * emitted array has exactly two elements - the first is a key from the object
   * and the second is a value corresponding to that key. Keys are extracted from
   * an object via `Object.keys` function, which means that they will be only
   * enumerable keys that are present on an object directly - not ones inherited
   * via prototype chain.
   *
   * By default these arrays are emitted synchronously. To change that you can
   * pass a {@link SchedulerLike} as a second argument to `pairs`.
   *
   * @example <caption>Converts a javascript object to an Observable</caption>
   * ```javascript
   * const obj = {
   *   foo: 42,
   *   bar: 56,
   *   baz: 78
   * };
   *
   * pairs(obj)
   * .subscribe(
   *   value => console.log(value),
   *   err => {},
   *   () => console.log('the end!')
   * );
   *
   * // Logs:
   * // ["foo", 42],
   * // ["bar", 56],
   * // ["baz", 78],
   * // "the end!"
   * ```
   *
   * @param {Object} obj The object to inspect and turn into an
   * Observable sequence.
   * @returns {(Observable<Array<string|T>>)} An observable sequence of
   * [key, value] pairs from the object.
   */
  function pairs(obj) {
      return sourceAsObservable(function (type, sink, subs) {
          var keys = Object.keys(obj);
          for (var i = 0; i < keys.length && !subs.closed; i++) {
              var key = keys[i];
              if (obj.hasOwnProperty(key)) {
                  sink(exports.FOType.NEXT, [key, obj[key]], subs);
              }
          }
          sink(exports.FOType.COMPLETE, undefined, subs);
      });
  }

  function publish(source) {
      return multicast(source, new Subject());
  }

  function publishBehavior(source, initialValue) {
      return multicast(source, new BehaviorSubject(initialValue));
  }

  function publishLast(source) {
      return multicast(source, new AsyncSubject());
  }

  function publishReplay(source, bufferSize, windowTime) {
      if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
      if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
      return multicast(source, new ReplaySubject(bufferSize, windowTime));
  }

  function race() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      if (sources.length === 1 && Array.isArray(sources[0])) {
          sources = sources[0];
      }
      return sourceAsObservable(raceSource(sources));
  }
  function raceSource(sources) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var allSubs_1 = [];
              for (var s = 0; s < sources.length; s++) {
                  var source = sources[s];
                  var src = tryUserFunction(fromSource, source);
                  if (resultIsError(src)) {
                      sink(exports.FOType.ERROR, src.error, subs);
                      return;
                  }
                  var mySubs = new Subscription();
                  subs.add(mySubs);
                  allSubs_1.push(mySubs);
                  src(exports.FOType.SUBSCRIBE, function (t, v, mySubs) {
                      if (allSubs_1 && t === exports.FOType.NEXT) {
                          for (var _i = 0, allSubs_2 = allSubs_1; _i < allSubs_2.length; _i++) {
                              var childSubs = allSubs_2[_i];
                              if (childSubs !== mySubs)
                                  childSubs.unsubscribe();
                          }
                          allSubs_1 = null;
                      }
                      sink(t, v, subs);
                  }, mySubs);
              }
          }
      };
  }

  /**
   * Creates an Observable that emits a sequence of numbers within a specified
   * range.
   *
   * <span class="informal">Emits a sequence of numbers in a range.</span>
   *
   * ![](range.png)
   *
   * `range` operator emits a range of sequential integers, in order, where you
   * select the `start` of the range and its `length`. By default, uses no
   * {@link SchedulerLike} and just delivers the notifications synchronously, but may use
   * an optional {@link SchedulerLike} to regulate those deliveries.
   *
   * ## Example
   * Emits the numbers 1 to 10</caption>
   * ```javascript
   * const numbers = range(1, 10);
   * numbers.subscribe(x => console.log(x));
   * ```
   * @see {@link timer}
   * @see {@link index/interval}
   *
   * @param {number} [start=0] The value of the first integer in the sequence.
   * @param {number} [count=0] The number of sequential integers to generate.
   * @return {Observable} An Observable of numbers that emits a finite range of
   * sequential integers.
   * @static true
   * @name range
   * @owner Observable
   */
  function range(start, count) {
      if (start === void 0) { start = 0; }
      if (count === void 0) { count = 0; }
      return sourceAsObservable(function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              var end = start + count;
              for (var n = start; n < end && !subs.closed; n++) {
                  sink(exports.FOType.NEXT, n, subs);
              }
              sink(exports.FOType.COMPLETE, undefined, subs);
          }
      });
  }

  function isNumeric(val) {
      // parseFloat NaNs numeric-cast false positives (null|true|false|"")
      // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
      // subtraction forces infinities to NaN
      // adding 1 corrects loss of precision from parseFloat (#15100)
      return !Array.isArray(val) && (val - parseFloat(val) + 1) >= 0;
  }

  function isScheduler(value) {
      return Boolean(value && typeof value.schedule === 'function');
  }

  /**
   * Creates an Observable that starts emitting after an `dueTime` and
   * emits ever increasing numbers after each `period` of time thereafter.
   *
   * <span class="informal">Its like {@link index/interval}, but you can specify when
   * should the emissions start.</span>
   *
   * ![](timer.png)
   *
   * `timer` returns an Observable that emits an infinite sequence of ascending
   * integers, with a constant interval of time, `period` of your choosing
   * between those emissions. The first emission happens after the specified
   * `dueTime`. The initial delay may be a `Date`. By default, this
   * operator uses the {@link asyncScheduler} {@link SchedulerLike} to provide a notion of time, but you
   * may pass any {@link SchedulerLike} to it. If `period` is not specified, the output
   * Observable emits only one value, `0`. Otherwise, it emits an infinite
   * sequence.
   *
   * ## Examples
   * ### Emits ascending numbers, one every second (1000ms), starting after 3 seconds
   * ```javascript
   * const numbers = timer(3000, 1000);
   * numbers.subscribe(x => console.log(x));
   * ```
   *
   * ### Emits one number after five seconds
   * ```javascript
   * const numbers = timer(5000);
   * numbers.subscribe(x => console.log(x));
   * ```
   * @see {@link index/interval}
   * @see {@link delay}
   *
   * @param {number|Date} [dueTime] The initial delay time specified as a Date object or as an integer denoting
   * milliseconds to wait before emitting the first value of 0`.
   * @param {number|SchedulerLike} [periodOrScheduler] The period of time between emissions of the
   * subsequent numbers.
   * @param {SchedulerLike} [scheduler=async] The {@link SchedulerLike} to use for scheduling
   * the emission of values, and providing a notion of "time".
   * @return {Observable} An Observable that emits a `0` after the
   * `dueTime` and ever increasing numbers after each `period` of time
   * thereafter.
   * @static true
   * @name timer
   * @owner Observable
   */
  function timer(dueTime, periodOrScheduler, scheduler) {
      if (dueTime === void 0) { dueTime = 0; }
      var period = -1;
      if (isNumeric(periodOrScheduler)) {
          period = Number(periodOrScheduler) < 1 && 1 || Number(periodOrScheduler);
      }
      else if (isScheduler(periodOrScheduler)) {
          scheduler = periodOrScheduler;
      }
      if (!isScheduler(scheduler)) {
          scheduler = asyncScheduler;
      }
      return sourceAsObservable(function (type, dest, subs) {
          if (type === void 0) { type = exports.FOType.SUBSCRIBE; }
          var due = isNumeric(dueTime)
              ? dueTime
              : (+dueTime - scheduler.now());
          if (type === exports.FOType.SUBSCRIBE) {
              scheduler.schedule(timerDelayWork, due, {
                  dest: dest,
                  scheduler: scheduler,
                  subs: subs,
                  i: 0,
                  period: period
              }, subs);
          }
      });
  }
  function timerDelayWork(state) {
      var dest = state.dest, scheduler = state.scheduler, subs = state.subs, period = state.period;
      if (subs.closed)
          return;
      dest(exports.FOType.NEXT, state.i++, subs);
      if (!subs.closed) {
          if (period >= 0) {
              scheduler.schedule(timerDelayWork, period, state, subs);
          }
          else {
              dest(exports.FOType.COMPLETE, undefined, subs);
          }
      }
  }

  /**
   * Creates an Observable that uses a resource which will be disposed at the same time as the Observable.
   *
   * <span class="informal">Use it when you catch yourself cleaning up after an Observable.</span>
   *
   * `using` is a factory operator, which accepts two functions. First function returns a disposable resource.
   * It can be an arbitrary object that implements `unsubscribe` method. Second function will be injected with
   * that object and should return an Observable. That Observable can use resource object during its execution.
   * Both functions passed to `using` will be called every time someone subscribes - neither an Observable nor
   * resource object will be shared in any way between subscriptions.
   *
   * When Observable returned by `using` is subscribed, Observable returned from the second function will be subscribed
   * as well. All its notifications (nexted values, completion and error events) will be emitted unchanged by the output
   * Observable. If however someone unsubscribes from the Observable or source Observable completes or errors by itself,
   * the `unsubscribe` method on resource object will be called. This can be used to do any necessary clean up, which
   * otherwise would have to be handled by hand. Note that complete or error notifications are not emitted when someone
   * cancels subscription to an Observable via `unsubscribe`, so `using` can be used as a hook, allowing you to make
   * sure that all resources which need to exist during an Observable execution will be disposed at appropriate time.
   *
   * @see {@link defer}
   *
   * @param {function(): ISubscription} resourceFactory A function which creates any resource object
   * that implements `unsubscribe` method.
   * @param {function(resource: ISubscription): Observable<T>} observableFactory A function which
   * creates an Observable, that can use injected resource object.
   * @return {Observable<T>} An Observable that behaves the same as Observable returned by `observableFactory`, but
   * which - when completed, errored or unsubscribed - will also call `unsubscribe` on created resource object.
   */
  function using(resourceFactory, observableFactory) {
      return new Observable(function (subscriber) {
          var resource;
          try {
              resource = resourceFactory();
          }
          catch (err) {
              subscriber.error(err);
              return undefined;
          }
          var result;
          try {
              result = observableFactory(resource);
          }
          catch (err) {
              subscriber.error(err);
              return undefined;
          }
          var source = result ? from(result) : EMPTY;
          var subscription = source.subscribe(subscriber);
          return function () {
              subscription.unsubscribe();
              if (resource) {
                  resource.unsubscribe();
              }
          };
      });
  }

  /* tslint:enable:max-line-length */
  function zip() {
      var sources = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          sources[_i] = arguments[_i];
      }
      return sourceAsObservable(zipSource(sources));
  }
  function zipSource(sources) {
      return function (type, sink, subs) {
          if (type === exports.FOType.SUBSCRIBE) {
              if (sources.length === 0) {
                  sink(exports.FOType.COMPLETE, undefined, subs);
                  return;
              }
              var state_2 = [];
              var _loop_1 = function (i) {
                  var buffer = [];
                  var currentState = {
                      buffer: buffer,
                      complete: false
                  };
                  state_2.push(currentState);
                  var source = sources[i];
                  var src = tryUserFunction(fromSource, source);
                  if (resultIsError(src)) {
                      sink(exports.FOType.ERROR, src.error, subs);
                      return { value: void 0 };
                  }
                  src(exports.FOType.SUBSCRIBE, function (t, v, subs) {
                      switch (t) {
                          case exports.FOType.NEXT:
                              buffer.push(v);
                              while (state_2.length === sources.length && state_2.every(function (_a) {
                                  var buffer = _a.buffer;
                                  return buffer.length > 0;
                              })) {
                                  sink(exports.FOType.NEXT, state_2.map(function (s) { return s.buffer.shift(); }), subs);
                              }
                              if (state_2.some(function (s) { return s.complete && s.buffer.length === 0; })) {
                                  sink(exports.FOType.COMPLETE, undefined, subs);
                                  subs.unsubscribe();
                              }
                              break;
                          case exports.FOType.ERROR:
                              sink(t, v, subs);
                              break;
                          case exports.FOType.COMPLETE:
                              currentState.complete = true;
                              if (buffer.length === 0) {
                                  sink(t, v, subs);
                                  subs.unsubscribe();
                              }
                              break;
                          default:
                              break;
                      }
                  }, subs);
              };
              for (var i = 0; i < sources.length; i++) {
                  var state_1 = _loop_1(i);
                  if (typeof state_1 === "object")
                      return state_1.value;
              }
          }
      };
  }

  function ArgumentOutOfRangeErrorImpl() {
      Error.call(this);
      this.message = 'argument out of range';
      this.name = 'ArgumentOutOfRangeError';
      return this;
  }
  ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);
  /**
   * An error thrown when an element was queried at a certain index of an
   * Observable, but no such index or position exists in that sequence.
   *
   * @see {@link elementAt}
   * @see {@link take}
   * @see {@link takeLast}
   *
   * @class ArgumentOutOfRangeError
   */
  var ArgumentOutOfRangeError = ArgumentOutOfRangeErrorImpl;

  function EmptyErrorImpl() {
      Error.call(this);
      this.message = 'no elements in sequence';
      this.name = 'EmptyError';
      return this;
  }
  EmptyErrorImpl.prototype = Object.create(Error.prototype);
  /**
   * An error thrown when an Observable or a sequence was queried but has no
   * elements.
   *
   * @see {@link first}
   * @see {@link last}
   * @see {@link single}
   *
   * @class EmptyError
   */
  var EmptyError = EmptyErrorImpl;

  function TimeoutErrorImpl() {
      Error.call(this);
      this.message = 'Timeout has occurred';
      this.name = 'TimeoutError';
      return this;
  }
  TimeoutErrorImpl.prototype = Object.create(Error.prototype);
  /**
   * An error thrown when duetime elapses.
   *
   * @see {@link timeout}
   *
   * @class TimeoutError
   */
  var TimeoutError = TimeoutErrorImpl;

  var toAnimate = [];
  var animId = 0;
  var animationFrameScheduler = {
      now: function () {
          return Date.now();
      },
      schedule: function (work, delay, state, subs) {
          if (delay === void 0) { delay = 0; }
          if (state === void 0) { state = undefined; }
          subs = subs || new Subscription();
          if (delay > 0) {
              asyncScheduler.schedule(function (state) {
                  animationFrameScheduler.schedule(work, 0, state, subs);
              }, delay, state, subs);
          }
          else {
              toAnimate.push(work, state);
              subs.add(function () {
                  var i = toAnimate.indexOf(work);
                  if (i >= 0) {
                      toAnimate.splice(i, 2);
                      if (toAnimate.length === 0) {
                          cancelAnimationFrame(animId);
                      }
                  }
              });
              if (toAnimate.length === 2) {
                  animId = requestAnimationFrame(function () {
                      while (toAnimate.length > 0) {
                          toAnimate.shift()(toAnimate.shift());
                      }
                  });
              }
          }
          return subs;
      }
  };

  var p = Promise.resolve();
  var asapScheduler = {
      now: function () {
          return Date.now();
      },
      schedule: function (work, delay, state, subs) {
          if (delay === void 0) { delay = 0; }
          if (state === void 0) { state = undefined; }
          subs = subs || new Subscription();
          if (delay > 0) {
              asyncScheduler.schedule(work, delay, state, subs);
              return subs;
          }
          var stop = false;
          subs.add(function () { return stop = true; });
          p.then(function () {
              if (!stop) {
                  work(state);
              }
          });
          return subs;
      }
  };

  function QueueSchedulerImpl() {
      this._flushing = false;
      this._queue = [];
  }
  var proto = QueueSchedulerImpl.prototype;
  proto.now = function () {
      return Date.now();
  };
  proto.schedule = function (work, delay, state, subs) {
      if (delay === void 0) { delay = 0; }
      if (state === void 0) { state = undefined; }
      subs = subs || new Subscription();
      if (delay > 0) {
          return asyncScheduler.schedule(work, delay, state, subs);
      }
      var queue = this._queue;
      subs.add(function () {
          var i = queue.indexOf(work);
          queue.splice(i, 2);
      });
      queue.push(work, state);
      if (!this._flushing) {
          this._flushing = true;
          while (queue.length > 0) {
              queue.shift()(queue.shift());
          }
          this._flushing = false;
      }
      return subs;
  };
  var QueueScheduler = QueueSchedulerImpl;
  var queueScheduler = new QueueScheduler();

  function VirtualTimeSchedulerImpl(maxFrames) {
      if (maxFrames === void 0) { maxFrames = Number.POSITIVE_INFINITY; }
      this._actions = [];
      this._flushing = false;
      this.maxFrames = Number.POSITIVE_INFINITY;
      this.frame = 0;
      this.frameTimeFactor = 1;
      this.index = -1;
  }
  var proto$1 = VirtualTimeSchedulerImpl.prototype;
  proto$1.schedule = function (work, delay, state, subs) {
      if (delay === void 0) { delay = 0; }
      if (state === void 0) { state = undefined; }
      subs = subs || new Subscription();
      var actions = this._actions;
      var action = {
          index: this.index++,
          delay: this.frame + delay,
          work: work,
          state: state,
          subs: subs
      };
      subs.add(function () {
          var i = actions.indexOf(action);
          if (i >= 0) {
              actions.splice(i, 1);
          }
      });
      actions.push(action);
      actions.sort(sortActions);
      return subs;
  };
  proto$1.now = function () {
      return this.frame;
  };
  proto$1.flush = function () {
      if (!this._flushing) {
          var actions = this._actions;
          var maxFrames = this.maxFrames;
          this._flushing = true;
          var action = void 0;
          while (action = actions.shift()) {
              // ) && (this.frame = action.delay) <= maxFrames
              if (this.frame > action.delay) {
                  // skip frames that were scheduled in the past. That shouldn't be possible.
                  continue;
              }
              this.frame = action.delay;
              if (this.frame > maxFrames) {
                  break;
              }
              try {
                  action.work(action.state);
              }
              catch (err) {
                  while (actions.length > 0) {
                      actions.shift().subs.unsubscribe();
                  }
                  throw err;
              }
          }
          actions.length = 0;
          this._flushing = false;
      }
  };
  var VirtualTimeScheduler = VirtualTimeSchedulerImpl;
  function sortActions(a, b) {
      if (a.delay === b.delay) {
          if (a.index === b.index) {
              return 0;
          }
          else if (a.index > b.index) {
              return 1;
          }
          else {
              return -1;
          }
      }
      else if (a.delay > b.delay) {
          return 1;
      }
      else {
          return -1;
      }
  }

  exports.AsyncSubject = AsyncSubject;
  exports.BehaviorSubject = BehaviorSubject;
  exports.ConnectableObservable = ConnectableObservable;
  exports.Notification = Notification;
  exports.Observable = Observable;
  exports.Subject = Subject;
  exports.Subscriber = Subscriber;
  exports.Subscription = Subscription;
  exports.ReplaySubject = ReplaySubject;
  exports.EMPTY = EMPTY;
  exports.NEVER = NEVER;
  exports.combineLatest = combineLatest;
  exports.concat = concat;
  exports.defer = defer;
  exports.forkJoin = forkJoin;
  exports.from = from;
  exports.fromEvent = fromEvent;
  exports.fromEventPattern = fromEventPattern;
  exports.fromScheduled = fromScheduled;
  exports.iif = iif;
  exports.interval = interval;
  exports.merge = merge;
  exports.multicast = multicast;
  exports.of = of;
  exports.onEmptyResumeNext = onEmptyResumeNext;
  exports.onErrorResumeNext = onErrorResumeNext;
  exports.partition = partition;
  exports.pairs = pairs;
  exports.publish = publish;
  exports.publishBehavior = publishBehavior;
  exports.publishLast = publishLast;
  exports.publishReplay = publishReplay;
  exports.race = race;
  exports.range = range;
  exports.throwError = throwError;
  exports.timer = timer;
  exports.using = using;
  exports.zip = zip;
  exports.identity = identity;
  exports.noop = noop;
  exports.pipe = pipe;
  exports.isObservable = isObservable;
  exports.ArgumentOutOfRangeError = ArgumentOutOfRangeError;
  exports.EmptyError = EmptyError;
  exports.ObjectUnsubscribedError = ObjectUnsubscribedError;
  exports.TimeoutError = TimeoutError;
  exports.UnsubscriptionError = UnsubscriptionError;
  exports.animationFrameScheduler = animationFrameScheduler;
  exports.asapScheduler = asapScheduler;
  exports.asyncScheduler = asyncScheduler;
  exports.queueScheduler = queueScheduler;
  exports.QueueScheduler = QueueScheduler;
  exports.VirtualTimeScheduler = VirtualTimeScheduler;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=rxjs.umd.js.map
