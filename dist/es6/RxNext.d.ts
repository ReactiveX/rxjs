import Observable from './Observable';
import Subscriber from './Subscriber';
import NextTickScheduler from './scheduler/NextTickScheduler';
import Scheduler from './scheduler/Scheduler';
import CompositeSubscription from './CompositeSubscription';
import SerialSubscription from './SerialSubscription';
import Subject from './Subject';
import BehaviorSubject from './BehaviorSubject';
import ConnectableObservable from './ConnectableObservable';
declare var RxNext: {
    Scheduler: {
        nextTick: NextTickScheduler;
        immediate: Scheduler;
    };
    Subscriber: typeof Subscriber;
    Observable: typeof Observable;
    CompositeSubscription: typeof CompositeSubscription;
    SerialSubscription: typeof SerialSubscription;
    Subject: typeof Subject;
    BehaviorSubject: typeof BehaviorSubject;
    ConnectableObservable: typeof ConnectableObservable;
};
export default RxNext;
