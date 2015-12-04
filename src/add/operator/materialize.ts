import {Observable} from '../../Observable';
import {materialize} from '../../operator/materialize';
Observable.prototype.materialize = materialize;
