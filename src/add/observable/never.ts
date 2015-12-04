import {Observable} from '../../Observable';
import {InfiniteObservable} from '../../observable/never';
Observable.never = InfiniteObservable.create;
