import MapObserver from '../observer/map-observer';
import SubscriptionReference from '../subscription/subscription-reference';
import CompositeSubscriptionReference from '../subscription/composite-subscription-reference';
import CompositeSubscription from '../subscription/composite-subscription';
import MergeAllObserver from '../observer/merge-all-observer';
import Subscription from '../subscription/subscription';
import currentFrameScheduler from '../scheduler/current-frame';

function noop() {}

export class Observable {
  constructor(observer, scheduler) {
    this._observer = observer;
    this._scheduler = scheduler || currentFrameScheduler;
  }
  
  observer(generator) {
    var state = {
      source: this,
      generator: generator,
      subscriptionReference: new SubscriptionReference()
    }

    this._scheduler.schedule(state, this.scheduledObservation);

    return state.subscriptionReference;
  }

  scheduledObservation(scheduler, state) {
    var result = state.source._observer(state.generator);
    switch(typeof result) {
      case 'undefined':
        return new Subscription(noop);
      case 'function':
        return new Subscription(result);
      default:
        return result;
    }
  }
  
  lift(generatorTransform, subscriptionReference) {
    var self = this;
    return new Observable(function(generator) {
      var subscriptionReference = new SubscriptionReference();

      subscriptionReference.setSubscription(self.observer(generatorTransform.call(this, {
        next(value) {
          var iterationResult = generator.next(value);
          if(typeof iterationResult !== 'undefined' && iterationResult.done) {
            subscriptionReference.dispose();
          }
          return iterationResult;
        },
        
        throw(err) {
          subscriptionReference.dispose();
          var _throw = generator.throw;
          if(_throw) {
            return _throw.call(this, err);
          }
        },
        
        return(value) {
          subscriptionReference.dispose();
          var ret = generator.return;
          if(ret) {
            return ret.call(this, value);
          }
        }
      })));
      
      return subscriptionReference.value;
    });
  }
    
  map(projection) {
    return this.lift((generator) => ({
      next(value) {
        return generator.next(projection(value));
      },
      
      throw(err) {
        return generator.throw(err);
      },
      
      return(value) {
        return generator.return(value);
      }
    }));
  }

  filter(predicate) {
    return this.lift((generator) => ({
      next(value) {
        if(predicate(value)) {
          return generator.next(value);
        }
      },
      
      throw(err) {
        return generator.throw(err);
      },
      
      return(value) {
        return generator.return(value);
      }
    }));
  }

  // Observable/Observer pair methods
  map2(projection) {
    return new MapObservable(this, projection);
  }

  flatMap(projection) {
    var subscriptionRef = new CompositeSubscriptionReference();
    return this.lift((generator) => ({
      next(value) {
        var innerObservable = projection(value);
        subscriptionRef.add(innerObservable.observer({
          next(value) {
            return generator.next(value);
          },

          throw(err) {
            return generator.throw(err);
          },

          return(value) {
            return generator.next(value);
          }
        }));
      },

      throw(err) {
        generator.throw(err);
      },

      return(value) {
        generator.return(value);
      }
    }));
  }

  flatMap2(projection) {
    return this.map2(projection).mergeAll();
  }

  mergeAll() {
    return new MergeAllObservable(this);
  }
}

Observable.return = function(value) {
  return new Observable((generator) => {
    generator.next(value);
    generator.return(value);
  });
};


export class MergeAllObservable extends Observable {
  constructor(source) {
    this._source = source;
    Observable.call(this, this._observer);
  }

  _observer(generator) {
    var subscriptionReference = new SubscriptionReference();
    subscriptionReference.setSubscription(this._source.observer(new MergeAllObserver(generator, subscriptionReference)));
    return subscriptionReference.value;
  }
}

export class MapObservable extends Observable {
  constructor(source, projection) {
    this._projection = projection;
    this._source = source;
    Observable.call(this, this._observer);
  }
  
  _observer(generator) {
    var subscriptionReference = new SubscriptionReference();
    subscriptionReference.setSubscription(this._source.observer(new MapObserver(this._projection, generator, subscriptionReference)));
    return subscriptionReference.value;
  }
}