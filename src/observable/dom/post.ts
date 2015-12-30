import {Observable} from '../../Observable';
import {AjaxObservable} from './ajax';

function post(url: string | any, body?: any): Observable<any> {
  if (typeof url === 'string') {
    return new AjaxObservable({ url, body, method: 'POST' });
  } else {
    (<any> url).method = 'POST';
    return new AjaxObservable((<any> url));
  }
}

export { AjaxObservable, post };
