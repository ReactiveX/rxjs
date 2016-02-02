import {Observable} from '../../Observable';
import {NeverObservable} from '../../observable/NeverObservable';

Observable.never = NeverObservable.create;