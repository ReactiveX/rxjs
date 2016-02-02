import {Observable} from '../../../Observable';
import {AjaxObservable} from '../../../observable/dom/AjaxObservable';

Observable.ajax = AjaxObservable.create;

declare module '../../../Observable' {
  namespace Observable {
    export let ajax: typeof AjaxObservable.create;
  }
}