import {Observable} from '../../Observable';
import {ForkJoinObservable} from '../../observable/ForkJoinObservable';

Observable.forkJoin = ForkJoinObservable.create;