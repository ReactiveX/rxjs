import {Observable} from '../../Observable';
import {FromEventObservable} from '../../observable/FromEventObservable';

Observable.fromEvent = FromEventObservable.create;