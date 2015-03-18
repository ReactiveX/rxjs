import MapObserver from '../observer/map-observer';
import FlatMapObserver from '../observer/flat-map-observer';
import SubscriptionReference from '../subscription-reference';
import CompositeSubscriptionReference from '../composite-subscription-reference';
import CompositeSubscription from '../composite-subscription';

export default class Observable {
  constructor(observer) {
    if(typeof observer !== 'undefined') {
      this._observer = observer;
    }
  }
  
  observer(generator) {
    return this._observer(generator);
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

          error(err) {
            return generator.error(err);
          },

          return(value) {
            return generator.next(value);
          }
        }));
      },

      error(err) {
        generator.error(err);
      },

      return(value) {
        generator.return(value);
      }
    }));
  }

  flatMap2(projection) {
    return new FlatMapObservable(this, projection);
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


export class FlatMapObservable extends Observable {
  constructor(source, projection) {
    this._projection = projection;
    this._source = source;
    Observable.call(this, this._observer);
  }
  
  _observer(generator) {
    var subscriptionReference = new CompositeSubscriptionReference(new CompositeSubscription());
    subscriptionReference.setSubscription(this._source.observer(new FlatMapObserver(this._projection, generator, subscriptionReference)));
    return subscriptionReference.value;
  }
}