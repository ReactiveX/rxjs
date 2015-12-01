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
  mergeScan?: <T, R>(project: (acc: R, x: T) => Observable<R>, seed: R) => Observable<R>;
  switchFirst?: () => Observable<T>;
  switchMapFirst?: <R>(project: ((x: T, ix: number) => Observable<any>),
                       projectResult?: (x: T, y: any, ix: number, iy: number) => R) => Observable<R>;
}

// statics
/* tslint:disable:no-use-before-declare */
import './operator/combineLatest-static';
import './operator/concat-static';
import './operator/merge-static';
import './observable/defer';
import './observable/empty';
import './observable/forkJoin';
import './observable/from';
import './observable/fromArray';
import './observable/fromEvent';
import './observable/fromEventPattern';
import './observable/fromPromise';
import './observable/fromCallback';
import './observable/interval';
import './observable/never';
import './observable/range';
import './observable/throw';
import './observable/timer';
import './operator/zip-static';

// Operators
import './operator/buffer';
import './operator/bufferCount';
import './operator/bufferTime';
import './operator/bufferToggle';
import './operator/bufferWhen';
import './operator/catch';
import './operator/combineAll';
import './operator/combineLatest';
import './operator/concat';
import './operator/concatAll';
import './operator/concatMap';
import './operator/concatMapTo';
import './operator/count';
import './operator/dematerialize';
import './operator/debounce';
import './operator/debounceTime';
import './operator/defaultIfEmpty';
import './operator/delay';
import './operator/distinctUntilChanged';
import './operator/extended/distinctUntilKeyChanged';
import './operator/do';
import './operator/extended/elementAt';
import './operator/expand';
import './operator/filter';
import './operator/extended/find';
import './operator/extended/findIndex';
import './operator/finally';
import './operator/first';
import './operator/groupBy';
import './operator/ignoreElements';
import './operator/extended/isEmpty';
import './operator/every';
import './operator/last';
import './operator/map';
import './operator/mapTo';
import './operator/materialize';
import './operator/extended/max';
import './operator/merge';
import './operator/mergeAll';
import './operator/mergeMap';
import './operator/mergeMapTo';
import './operator/extended/mergeScan';
import './operator/extended/min';
import './operator/multicast';
import './operator/observeOn';
import './operator/partition';
import './operator/publish';
import './operator/publishBehavior';
import './operator/publishReplay';
import './operator/reduce';
import './operator/repeat';
import './operator/retry';
import './operator/retryWhen';
import './operator/sample';
import './operator/sampleTime';
import './operator/scan';
import './operator/share';
import './operator/single';
import './operator/skip';
import './operator/skipUntil';
import './operator/skipWhile';
import './operator/startWith';
import './operator/subscribeOn';
import './operator/switch';
import './operator/switchMap';
import './operator/switchMapTo';
import './operator/take';
import './operator/takeUntil';
import './operator/takeWhile';
import './operator/throttle';
import './operator/throttleTime';
import './operator/extended/timeInterval';
import './operator/timeout';
import './operator/timeoutWith';
import './operator/toArray';
import './operator/toPromise';
import './operator/window';
import './operator/windowCount';
import './operator/windowTime';
import './operator/windowToggle';
import './operator/windowWhen';
import './operator/withLatestFrom';
import './operator/zip';
import './operator/zipAll';

/* tslint:disable:no-unused-variable */
import {Subject} from './Subject';
import {Subscription} from './Subscription';
import {Subscriber} from './Subscriber';
import {ReplaySubject} from './subject/ReplaySubject';
import {BehaviorSubject} from './subject/BehaviorSubject';
import {ConnectableObservable} from './observable/ConnectableObservable';
import {Notification} from './Notification';
import {EmptyError} from './util/EmptyError';
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
    ReplaySubject,
    BehaviorSubject,
    ConnectableObservable,
    Notification,
    EmptyError,
    ArgumentOutOfRangeError,
    TestScheduler,
    VirtualTimeScheduler,
    TimeInterval
};
