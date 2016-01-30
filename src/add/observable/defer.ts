import {Observable} from '../../Observable';
import {DeferObservable} from '../../observable/DeferObservable';

Observable.defer = DeferObservable.create;