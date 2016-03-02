import {PartialObserver} from './Observer';
import {Operator} from './Operator';
import {Subscriber} from './Subscriber';
import {Subscription} from './Subscription';
import {root} from './util/root';
import {CoreOperators} from './CoreOperators';
import {SymbolShim} from './util/SymbolShim';
import {toSubscriber} from './util/toSubscriber';
import {tryCatch} from './util/tryCatch';
import {errorObject} from './util/errorObject';

import {combineLatestStatic} from './operator/combineLatest';
import {concatStatic} from './operator/concat';
import {mergeStatic} from './operator/merge';
import {zipStatic} from './operator/zip';
import {BoundCallbackObservable} from './observable/BoundCallbackObservable';
import {BoundNodeCallbackObservable} from './observable/BoundNodeCallbackObservable';
import {DeferObservable} from './observable/DeferObservable';
import {EmptyObservable} from './observable/EmptyObservable';
import {ForkJoinObservable} from './observable/ForkJoinObservable';
import {FromObservable} from './observable/FromObservable';
import {ArrayObservable} from './observable/ArrayObservable';
import {FromEventObservable} from './observable/FromEventObservable';
import {FromEventPatternObservable} from './observable/FromEventPatternObservable';
import {PromiseObservable} from './observable/PromiseObservable';
import {IntervalObservable} from './observable/IntervalObservable';
import {TimerObservable} from './observable/TimerObservable';
import {raceStatic} from './operator/race';
import {RangeObservable} from './observable/RangeObservable';
import {NeverObservable} from './observable/NeverObservable';
import {ErrorObservable} from './observable/ErrorObservable';
import {UsingObservable} from './observable/UsingObservable';
import {AjaxCreationMethod} from './observable/dom/AjaxObservable';
import {WebSocketSubject} from './observable/dom/WebSocketSubject';

import {CombineLatestSignature} from './operator/combineLatest';
import {WithLatestFromSignature} from './operator/withLatestFrom';
import {ZipSignature} from './operator/zip';
import {BufferSignature} from './operator/buffer';
import {BufferCountSignature} from './operator/bufferCount';
import {BufferTimeSignature} from './operator/bufferTime';
import {BufferToggleSignature} from './operator/bufferToggle';
import {BufferWhenSignature} from './operator/bufferWhen';
import {WindowSignature} from './operator/window';
import {WindowCountSignature} from './operator/windowCount';
import {WindowTimeSignature} from './operator/windowTime';
import {WindowToggleSignature} from './operator/windowToggle';
import {WindowWhenSignature} from './operator/windowWhen';
import {CacheSignature} from './operator/cache';
import {CatchSignature} from './operator/catch';
import {CountSignature} from './operator/count';
import {DematerializeSignature} from './operator/dematerialize';
import {DebounceSignature} from './operator/debounce';
import {DebounceTimeSignature} from './operator/debounceTime';
import {DefaultIfEmptySignature} from './operator/defaultIfEmpty';
import {DelaySignature} from './operator/delay';
import {DelayWhenSignature} from './operator/delayWhen';
import {DistinctUntilChangedSignature} from './operator/distinctUntilChanged';
import {DoSignature} from './operator/do';
import {ExpandSignature} from './operator/expand';
import {FilterSignature} from './operator/filter';
import {FinallySignature} from './operator/finally';
import {FirstSignature} from './operator/first';
import {GroupBySignature} from './operator/groupBy';
import {IgnoreElementsSignature} from './operator/ignoreElements';
import {InspectSignature} from './operator/inspect';
import {InspectTimeSignature} from './operator/inspectTime';
import {LastSignature} from './operator/last';
import {LetSignature} from './operator/let';
import {EverySignature} from './operator/every';
import {MaterializeSignature} from './operator/materialize';
import {MulticastSignature} from './operator/multicast';
import {ObserveOnSignature} from './operator/observeOn';
import {PartitionSignature} from './operator/partition';
import {PluckSignature} from './operator/pluck';
import {PublishSignature} from './operator/publish';
import {PublishBehaviorSignature} from './operator/publishBehavior';
import {PublishReplaySignature} from './operator/publishReplay';
import {PublishLastSignature} from './operator/publishLast';
import {RaceSignature} from './operator/race';
import {ReduceSignature} from './operator/reduce';
import {RepeatSignature} from './operator/repeat';
import {RetrySignature} from './operator/retry';
import {RetryWhenSignature} from './operator/retryWhen';
import {SampleSignature} from './operator/sample';
import {SampleTimeSignature} from './operator/sampleTime';
import {ScanSignature} from './operator/scan';
import {ShareSignature} from './operator/share';
import {SingleSignature} from './operator/single';
import {SkipSignature} from './operator/skip';
import {SkipUntilSignature} from './operator/skipUntil';
import {SkipWhileSignature} from './operator/skipWhile';
import {StartWithSignature} from './operator/startWith';
import {SubscribeOnSignature} from './operator/subscribeOn';
import {TakeSignature} from './operator/take';
import {TakeLastSignature} from './operator/takeLast';
import {TakeUntilSignature} from './operator/takeUntil';
import {TakeWhileSignature} from './operator/takeWhile';
import {ThrottleSignature} from './operator/throttle';
import {ThrottleTimeSignature} from './operator/throttleTime';
import {TimeoutSignature} from './operator/timeout';
import {TimeoutWithSignature} from './operator/timeoutWith';
import {ToArraySignature} from './operator/toArray';
import {ToPromiseSignature} from './operator/toPromise';
import {CombineAllSignature} from './operator/combineAll';
import {ConcatSignature} from './operator/concat';
import {ConcatAllSignature} from './operator/concatAll';
import {ConcatMapSignature} from './operator/concatMap';
import {ConcatMapToSignature} from './operator/concatMapTo';
import {MapSignature} from './operator/map';
import {MapToSignature} from './operator/mapTo';
import {MergeSignature} from './operator/merge';
import {MergeAllSignature} from './operator/mergeAll';
import {MergeMapSignature} from './operator/mergeMap';
import {MergeMapToSignature} from './operator/mergeMapTo';
import {SwitchSignature} from './operator/switch';
import {SwitchMapSignature} from './operator/switchMap';
import {SwitchMapToSignature} from './operator/switchMapTo';
import {ZipAllSignature} from './operator/zipAll';

export type ObservableOrPromise<T> = Observable<T> | Promise<T>;
export type ArrayOrIterator<T> = Iterator<T> | ArrayLike<T>;
export type ObservableInput<T> = ObservableOrPromise<T> | ArrayOrIterator<T>;

/**
 * A representation of any set of values over any amount of time. This the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
export class Observable<T> implements CoreOperators<T>  {

  public _isScalar: boolean = false;

  protected source: Observable<any>;
  protected operator: Operator<any, T>;

  /**
   * @constructor
   * @param {Function} subscribe the function that is  called when the Observable is
   * initially subscribed to. This function is given a Subscriber, to which new values
   * can be `next`ed, or an `error` method can be called to raise an error, or
   * `complete` can be called to notify of a successful completion.
   */
  constructor(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription | Function | void) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }

  // HACK: Since TypeScript inherits static properties too, we have to
  // fight against TypeScript here so Subject can have a different static create signature
  /**
   * Creates a new cold Observable by calling the Observable constructor
   * @static true
   * @owner Observable
   * @method create
   * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
   * @return {Observable} a new cold observable
   */
  static create: Function = <T>(subscribe?: <R>(subscriber: Subscriber<R>) => Subscription | Function | void) => {
    return new Observable<T>(subscribe);
  };

  /**
   * Creates a new Observable, with this Observable as the source, and the passed
   * operator defined as the new observable's operator.
   * @method lift
   * @param {Operator} operator the operator defining the operation to take on the observable
   * @return {Observable} a new observable with the Operator applied
   */
  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = new Observable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  /**
   * Registers handlers for handling emitted values, error and completions from the observable, and
   *  executes the observable's subscriber function, which will take action to set up the underlying data stream
   * @method subscribe
   * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
   *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
   * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
   *  the error will be thrown as unhandled
   * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
   * @return {Subscription} a subscription reference to the registered handlers
   */
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {

    const { operator } = this;
    const subscriber = toSubscriber(observerOrNext, error, complete);

    if (operator) {
      subscriber.add(this._subscribe(operator.call(subscriber)));
    } else {
      subscriber.add(this._subscribe(subscriber));
    }

    if (subscriber.syncErrorThrowable) {
      subscriber.syncErrorThrowable = false;
      if (subscriber.syncErrorThrown) {
        throw subscriber.syncErrorValue;
      }
    }

    return subscriber;
  }

  /**
   * @method forEach
   * @param {Function} next a handler for each value emitted by the observable
   * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
   * @return {Promise} a promise that either resolves on observable completion or
   *  rejects with the handled error
   */
  forEach(next: (value: T) => void, PromiseCtor?: typeof Promise): Promise<void> {
    if (!PromiseCtor) {
      if (root.Rx && root.Rx.config && root.Rx.config.Promise) {
        PromiseCtor = root.Rx.config.Promise;
      } else if (root.Promise) {
        PromiseCtor = root.Promise;
      }
    }

    if (!PromiseCtor) {
      throw new Error('no Promise impl found');
    }

    const source = this;

    return new PromiseCtor<void>((resolve, reject) => {
      source.subscribe((value: T) => {
        const result: any = tryCatch(next)(value);
        if (result === errorObject) {
          reject(errorObject.e);
        }
      }, reject, resolve);
    });
  }

  protected _subscribe(subscriber: Subscriber<any>): Subscription | Function | void {
    return this.source.subscribe(subscriber);
  }

  // static method stubs
  static ajax: AjaxCreationMethod;
  static bindCallback: typeof BoundCallbackObservable.create;
  static bindNodeCallback: typeof BoundNodeCallbackObservable.create;
  static combineLatest: typeof combineLatestStatic;
  static concat: typeof concatStatic;
  static defer: typeof DeferObservable.create;
  static empty: typeof EmptyObservable.create;
  static forkJoin: typeof ForkJoinObservable.create;
  static from: typeof FromObservable.create;
  static fromArray: typeof ArrayObservable.create;
  static fromEvent: typeof FromEventObservable.create;
  static fromEventPattern: typeof FromEventPatternObservable.create;
  static fromPromise: typeof PromiseObservable.create;
  static interval: typeof IntervalObservable.create;
  static merge: typeof mergeStatic;
  static never: typeof NeverObservable.create;
  static of: typeof ArrayObservable.of;
  static race: typeof raceStatic;
  static range: typeof RangeObservable.create;
  static throw: typeof ErrorObservable.create;
  static timer: typeof TimerObservable.create;
  static using: typeof UsingObservable.create;
  static webSocket: typeof WebSocketSubject.create;
  static zip: typeof zipStatic;

  // core operators
  buffer: BufferSignature<T>;
  bufferCount: BufferCountSignature<T>;
  bufferTime: BufferTimeSignature<T>;
  bufferToggle: BufferToggleSignature<T>;
  bufferWhen: BufferWhenSignature<T>;
  cache: CacheSignature<T>;
  catch: CatchSignature<T>;
  combineAll: CombineAllSignature<T>;
  combineLatest: CombineLatestSignature<T>;
  concat: ConcatSignature<T>;
  concatAll: ConcatAllSignature<T>;
  concatMap: ConcatMapSignature<T>;
  concatMapTo: ConcatMapToSignature<T>;
  count: CountSignature<T>;
  dematerialize: DematerializeSignature<T>;
  debounce: DebounceSignature<T>;
  debounceTime: DebounceTimeSignature<T>;
  defaultIfEmpty: DefaultIfEmptySignature<T>;
  delay: DelaySignature<T>;
  delayWhen: DelayWhenSignature<T>;
  distinctUntilChanged: DistinctUntilChangedSignature<T>;
  do: DoSignature<T>;
  expand: ExpandSignature<T>;
  filter: FilterSignature<T>;
  finally: FinallySignature<T>;
  first: FirstSignature<T>;
  flatMap: MergeMapSignature<T>;
  flatMapTo: MergeMapToSignature<T>;
  groupBy: GroupBySignature<T>;
  ignoreElements: IgnoreElementsSignature<T>;
  inspect: InspectSignature<T>;
  inspectTime: InspectTimeSignature<T>;
  last: LastSignature<T>;
  let: LetSignature<T>;
  letBind: LetSignature<T>;
  every: EverySignature<T>;
  map: MapSignature<T>;
  mapTo: MapToSignature<T>;
  materialize: MaterializeSignature<T>;
  merge: MergeSignature<T>;
  mergeAll: MergeAllSignature<T>;
  mergeMap: MergeMapSignature<T>;
  mergeMapTo: MergeMapToSignature<T>;
  multicast: MulticastSignature<T>;
  observeOn: ObserveOnSignature<T>;
  partition: PartitionSignature<T>;
  pluck: PluckSignature<T>;
  publish: PublishSignature<T>;
  publishBehavior: PublishBehaviorSignature<T>;
  publishReplay: PublishReplaySignature<T>;
  publishLast: PublishLastSignature<T>;
  race: RaceSignature<T>;
  reduce: ReduceSignature<T>;
  repeat: RepeatSignature<T>;
  retry: RetrySignature<T>;
  retryWhen: RetryWhenSignature<T>;
  sample: SampleSignature<T>;
  sampleTime: SampleTimeSignature<T>;
  scan: ScanSignature<T>;
  share: ShareSignature<T>;
  single: SingleSignature<T>;
  skip: SkipSignature<T>;
  skipUntil: SkipUntilSignature<T>;
  skipWhile: SkipWhileSignature<T>;
  startWith: StartWithSignature<T>;
  subscribeOn: SubscribeOnSignature<T>;
  switch: SwitchSignature<T>;
  switchMap: SwitchMapSignature<T>;
  switchMapTo: SwitchMapToSignature<T>;
  take: TakeSignature<T>;
  takeLast: TakeLastSignature<T>;
  takeUntil: TakeUntilSignature<T>;
  takeWhile: TakeWhileSignature<T>;
  throttle: ThrottleSignature<T>;
  throttleTime: ThrottleTimeSignature<T>;
  timeout: TimeoutSignature<T>;
  timeoutWith: TimeoutWithSignature<T>;
  toArray: ToArraySignature<T>;
  toPromise: ToPromiseSignature<T>;
  window: WindowSignature<T>;
  windowCount: WindowCountSignature<T>;
  windowTime: WindowTimeSignature<T>;
  windowToggle: WindowToggleSignature<T>;
  windowWhen: WindowWhenSignature<T>;
  withLatestFrom: WithLatestFromSignature<T>;
  zip: ZipSignature<T>;
  zipAll: ZipAllSignature<T>;

  /**
   * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
   * @method Symbol.observable
   * @return {Observable} this instance of the observable
   */
  [SymbolShim.observable]() {
    return this;
  }
}
