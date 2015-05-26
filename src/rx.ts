import {Observable} from './observable/observable';
import Subscription from './subscription/subscription';
//TODO: remove this hack once we have a better global bundling solution
(<any>window).Rx3 = {
  Observable,
  Subscription
};