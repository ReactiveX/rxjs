import { Observable } from 'rxjs';
import { ajax as staticAjax } from 'rxjs/ajax';
import { AjaxCreationMethod } from 'rxjs/internal/observable/dom/AjaxObservable';

Observable.ajax = staticAjax;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let ajax: AjaxCreationMethod;
  }
}
