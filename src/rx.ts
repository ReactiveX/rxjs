import {Observable} from './observable/observable';
//TODO: remove this hack once we have a better global bundling solution
(<any>window).Observable = Observable;