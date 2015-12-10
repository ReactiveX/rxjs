import {Observable} from '../../Observable';
import {ForkJoinObservable} from '../../observable/forkJoin';
Observable.forkJoin = ForkJoinObservable.create;

export var _void: void;