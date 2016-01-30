import {Observable} from '../../Observable';
import {ArrayObservable} from '../../observable/ArrayObservable';

Observable.fromArray = ArrayObservable.create;
Observable.of = ArrayObservable.of;