import {Observable} from '../../Observable';
import {take} from '../../operator/take';
Observable.prototype.take = take;
