import {Observable} from '../../Observable';
import {BoundCallbackObsevable} from '../../observable/bindCallback';
Observable.bindCallback = BoundCallbackObsevable.create;
