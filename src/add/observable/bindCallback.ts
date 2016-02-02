import {Observable} from '../../Observable';
import {BoundCallbackObservable} from '../../observable/BoundCallbackObservable';

Observable.bindCallback = BoundCallbackObservable.create;