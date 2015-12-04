import {Observable} from '../../Observable';
import {partition} from '../../operator/partition';
Observable.prototype.partition = partition;
