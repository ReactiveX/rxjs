import {Observable} from '../../Observable';
import {RangeObservable} from '../../observable/range';
Observable.range = RangeObservable.create;
