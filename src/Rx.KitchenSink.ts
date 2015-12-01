/* tslint:disable:no-unused-variable */
import {Subject} from './Subject';
/* tslint:enable:no-unused-variable */
import {Observable} from './Observable';
import {CoreOperators} from './CoreOperators';
import {Scheduler as IScheduler} from './Scheduler';

export interface KitchenSinkOperators<T> extends CoreOperators<T> {
  isEmpty?: () => Observable<boolean>;
  elementAt?: (index: number, defaultValue?: any) => Observable<T>;
  distinctUntilKeyChanged?: (key: string, compare?: (x: any, y: any) => boolean, thisArg?: any) => Observable<T>;
  find?: (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<T>;
  findIndex?: (predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any) => Observable<number>;
  max?: <T, R>(comparer?: (x: R, y: T) => R) => Observable<R>;
  min?: <T, R>(comparer?: (x: R, y: T) => R) => Observable<R>;
  timeInterval?: <T>(scheduler?: IScheduler) => Observable<T>;
  mergeScan?: <T, R>(project: (acc: R, x: T) => Observable<R>, seed: R, concurrent?: number) => Observable<R>;
  switchFirst?: () => Observable<T>;
  switchMapFirst?: <R>(project: ((x: T, ix: number) => Observable<any>),
                       projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
}

// statics
/* tslint:disable:no-use-before-declare */
import './add/operator/combineLatest-static';
import './add/operator/concat-static';
import './add/operator/merge-static';
import './add/observable/bindCallback';
import './add/observable/defer';
import './add/observable/empty';
import './add/observable/forkJoin';
import './add/observable/from';
import './add/observable/fromArray';
import './add/observable/fromEvent';
import './add/observable/fromEventPattern';
import './add/observable/fromPromise';
import './add/observable/interval';
import './add/observable/never';
import './add/observable/range';
import './add/observable/throw';
import './add/observable/timer';
import './add/operator/zip-static';

// Operators
import './add/operator/buffer';
import './add/operator/bufferCount';
import './add/operator/bufferTime';
import './add/operator/bufferToggle';
import './add/operator/bufferWhen';
import './add/operator/catch';
import './add/operator/combineAll';
import './add/operator/combineLatest';
import './add/operator/concat';
import './add/operator/concatAll';
import './add/operator/concatMap';
import './add/operator/concatMapTo';
import './add/operator/count';
import './add/operator/dematerialize';
import './add/operator/debounce';
import './add/operator/debounceTime';
import './add/operator/defaultIfEmpty';
import './add/operator/delay';
import './add/operator/distinctUntilChanged';
import './add/operator/extended/distinctUntilKeyChanged';
import './add/operator/do';
import './add/operator/extended/elementAt';
import './add/operator/expand';
import './add/operator/filter';
import './add/operator/extended/find';
import './add/operator/extended/findIndex';
import './add/operator/finally';
import './add/operator/first';
import './add/operator/groupBy';
import './add/operator/ignoreElements';
import './add/operator/extended/isEmpty';
import './add/operator/every';
import './add/operator/last';
import './add/operator/map';
import './add/operator/mapTo';
import './add/operator/materialize';
import './add/operator/extended/max';
import './add/operator/merge';
import './add/operator/mergeAll';
import './add/operator/mergeMap';
import './add/operator/mergeMapTo';
import './add/operator/extended/mergeScan';
import './add/operator/extended/min';
import './add/operator/multicast';
import './add/operator/observeOn';
import './add/operator/partition';
import './add/operator/publish';
import './add/operator/publishBehavior';
import './add/operator/publishReplay';
import './add/operator/publishLast';
import './add/operator/reduce';
import './add/operator/repeat';
import './add/operator/retry';
import './add/operator/retryWhen';
import './add/operator/sample';
import './add/operator/sampleTime';
import './add/operator/scan';
import './add/operator/share';
import './add/operator/single';
import './add/operator/skip';
import './add/operator/skipUntil';
import './add/operator/skipWhile';
import './add/operator/startWith';
import './add/operator/subscribeOn';
import './add/operator/switch';
import './add/operator/switchMap';
import './add/operator/switchMapTo';
import './add/operator/take';
import './add/operator/takeUntil';
import './add/operator/takeWhile';
import './add/operator/throttle';
import './add/operator/throttleTime';
import './add/operator/extended/timeInterval';
import './add/operator/timeout';
import './add/operator/timeoutWith';
import './add/operator/toArray';
import './add/operator/toPromise';
import './add/operator/window';
import './add/operator/windowCount';
import './add/operator/windowTime';
import './add/operator/windowToggle';
import './add/operator/windowWhen';
import './add/operator/withLatestFrom';
import './add/operator/zip';
import './add/operator/zipAll';

/* tslint:disable:no-unused-variable */
import {Subscription} from './Subscription';
import {Subscriber} from './Subscriber';
import {AsyncSubject} from './subject/AsyncSubject';
import {ReplaySubject} from './subject/ReplaySubject';
import {BehaviorSubject} from './subject/BehaviorSubject';
import {ConnectableObservable} from './observable/ConnectableObservable';
import {Notification} from './Notification';
import {EmptyError} from './util/EmptyError';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';
import {ArgumentOutOfRangeError} from './util/ArgumentOutOfRangeError';
import {nextTick} from './scheduler/nextTick';
import {immediate} from './scheduler/immediate';
import {NextTickScheduler} from './scheduler/NextTickScheduler';
import {ImmediateScheduler} from './scheduler/ImmediateScheduler';
import {TimeInterval} from './operator/extended/timeInterval';
import {TestScheduler} from './testing/TestScheduler';
import {VirtualTimeScheduler} from './scheduler/VirtualTimeScheduler';
/* tslint:enable:no-unused-variable */

/* tslint:disable:no-var-keyword */
var Scheduler = {
  nextTick,
  immediate
};
/* tslint:enable:no-var-keyword */

export {
    Subject,
    Scheduler,
    Observable,
    Subscriber,
    Subscription,
    AsyncSubject,
    ReplaySubject,
    BehaviorSubject,
    ConnectableObservable,
    Notification,
    EmptyError,
    ArgumentOutOfRangeError,
    ObjectUnsubscribedError,
    TestScheduler,
    VirtualTimeScheduler,
    TimeInterval
};
