import {Observable} from '../../Observable';
import {AjaxObservable} from './ajax';

function get(url: string | any): Observable<any>  {
  if (typeof url === 'string') {
    return new AjaxObservable({ url });
  } else {
    return new AjaxObservable(url);
  }
}

export { AjaxObservable, get };
