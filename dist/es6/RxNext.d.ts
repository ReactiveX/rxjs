import Observable from './Observable';
import Observer from './Observer';
import NextTickScheduler from './scheduler/NextTickScheduler';
import Scheduler from './scheduler/Scheduler';
import Subscription from './Subscription';
import CompositeSubscription from './CompositeSubscription';
import SerialSubscription from './SerialSubscription';
import Subject from './Subject';
import BehaviorSubject from './BehaviorSubject';
declare var RxNext: {
    Scheduler: {
        nextTick: NextTickScheduler;
        immediate: Scheduler;
    };
    Observer: typeof Observer;
    Observable: typeof Observable;
    Subscription: typeof Subscription;
    CompositeSubscription: typeof CompositeSubscription;
    SerialSubscription: typeof SerialSubscription;
    Subject: typeof Subject;
    BehaviorSubject: typeof BehaviorSubject;
};
export default RxNext;
