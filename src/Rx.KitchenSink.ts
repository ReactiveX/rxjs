/* tslint:disable:no-unused-variable */
import {Subject} from './Subject';
/* tslint:enable:no-unused-variable */
import {Observable} from './Observable';

import './Rx';

// statics
import './add/observable/using';

// Operators
import './add/operator/distinct';
import './add/operator/distinctKey';
import './add/operator/distinctUntilKeyChanged';
import './add/operator/elementAt';
import './add/operator/exhaust';
import './add/operator/exhaustMap';
import './add/operator/find';
import './add/operator/findIndex';
import './add/operator/isEmpty';
import './add/operator/max';
import './add/operator/mergeScan';
import './add/operator/min';
import './add/operator/pairwise';
import './add/operator/timeInterval';

/* tslint:disable:no-unused-variable */
import {Operator} from './Operator';
import {Observer} from './Observer';
import {Subscription, UnsubscriptionError} from './Subscription';
import {Subscriber} from './Subscriber';
import {AsyncSubject} from './subject/AsyncSubject';
import {ReplaySubject} from './subject/ReplaySubject';
import {BehaviorSubject} from './subject/BehaviorSubject';
import {ConnectableObservable} from './observable/ConnectableObservable';
import {Notification} from './Notification';
import {EmptyError} from './util/EmptyError';
import {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';
import {ArgumentOutOfRangeError} from './util/ArgumentOutOfRangeError';
import {asap} from './scheduler/asap';
import {async} from './scheduler/async';
import {queue} from './scheduler/queue';
import {AsapScheduler} from './scheduler/AsapScheduler';
import {AsyncScheduler} from './scheduler/AsyncScheduler';
import {QueueScheduler} from './scheduler/QueueScheduler';
import {TimeInterval} from './operator/timeInterval';
import {TestScheduler} from './testing/TestScheduler';
import {VirtualTimeScheduler} from './scheduler/VirtualTimeScheduler';
import {rxSubscriber} from './symbol/rxSubscriber';
/* tslint:enable:no-unused-variable */

/* tslint:disable:no-var-keyword */
var Scheduler = {
  asap,
  async,
  queue
};

var Symbol = {
  rxSubscriber
};
/* tslint:enable:no-var-keyword */

export {
    Subject,
    Scheduler,
    Observable,
    Observer,
    Operator,
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
    UnsubscriptionError,
    TestScheduler,
    VirtualTimeScheduler,
    TimeInterval,
    Symbol
};
