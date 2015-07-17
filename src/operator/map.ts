import Subscriber from '../Subscriber';
import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import SubscriberFactory from '../SubscriberFactory';

class MapSubscriber extends Subscriber {
  project:(any)=>any;
  
  constructor(destination:Subscriber, project:(any)=>any) {
    super(destination);
    this.project = project;
  }
  
  _next(value:any) {
    value = try_catch(this.project).call(this, value);
    if(value === error_obj) {
      this.destination.error(error_obj.e);
    } else {
      this.destination.next(value);
    }
  }
}

class MapSubscriberFactory extends SubscriberFactory {
  project: (any) => any;

  constructor(project: (any) => any) {
    super();
    this.project = project;
  }
  
  create(destination: Subscriber): Subscriber {
    return new MapSubscriber(destination, this.project);
  }
}

export default function select(project:(any)=>any) : Observable {
  return this.lift(new MapSubscriberFactory(project))
};
