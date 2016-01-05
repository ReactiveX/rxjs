import {root} from '../../util/root';
import {Observable} from '../../Observable';
import {AjaxObservable} from './ajax';

function getJSON(url: string | any): Observable<any> {
  if (!root.JSON && typeof root.JSON.parse !== 'function') {
    throw new TypeError('JSON is not supported in your runtime.');
  }
  return new AjaxObservable({ url, emitType: 'json', responseType: 'json' });
}

export { AjaxObservable, getJSON };
