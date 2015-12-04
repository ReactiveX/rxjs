import {Observable} from '../../Observable';
import {FromEventPatternObservable} from '../../observable/fromEventPattern';
Observable.fromEventPattern = FromEventPatternObservable.create;
