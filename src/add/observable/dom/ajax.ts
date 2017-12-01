import { Observable } from '../../../Observable';
import { ajax as staticAjax } from '../../../internal/observable/dom/ajax';
import { AjaxCreationMethod } from '../../../internal/observable/dom/AjaxObservable';

Observable.ajax = staticAjax;

declare module '../../../Observable' {
  namespace Observable {
    export let ajax: AjaxCreationMethod;
  }
}
