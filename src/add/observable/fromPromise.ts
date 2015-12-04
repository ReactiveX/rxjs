import {Observable} from '../../Observable';
import {PromiseObservable} from '../../observable/fromPromise';
Observable.fromPromise = PromiseObservable.create;
