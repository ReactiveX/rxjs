
import {Observable} from '../../Observable';
import {Notification} from '../../Notification';
import {materialize} from '../../operator/materialize';

Observable.prototype.materialize = materialize;

declare module '../../Observable' {
  interface Observable<T> {
    materialize: () => Observable<Notification<T>>;
  }
}

export var _void: void;