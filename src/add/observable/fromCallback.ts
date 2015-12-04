import {Observable} from '../../Observable';
import {CallbackObservable} from '../../observable/fromCallback';
Observable.fromCallback = CallbackObservable.create;
