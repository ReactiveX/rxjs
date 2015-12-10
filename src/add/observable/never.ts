import {Observable} from '../../Observable';
import {InfiniteObservable} from '../../observable/never';
Observable.never = InfiniteObservable.create;

export var _void: void;