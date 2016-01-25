import {Observable} from '../../Observable';
import {PromiseObservable} from '../../observable/PromiseObservable';

Observable.fromPromise = PromiseObservable.create;

export var _void: void;