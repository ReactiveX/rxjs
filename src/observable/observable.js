import MapObserver from '../observer/map-observer';
import SubscriptionReference from '../subscription-reference';

export default class Observable {
  constructor(observer) {
    if(typeof observer !== 'undefined') {
      this._observer = observer;
    }
  }
  
  observer(generator) {
    return this._observer(generator);
  }
  
  lift(generatorTransform) {
    var self = this;
    return new Observable(function(generator) {
      var subscriptionReference = new SubscriptionReference();
      subscriptionReference.value = self.observer(generatorTransform.call(this, {
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
      }));
      
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
      
      return(err) {
        return generator.return(err);
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
      
      return(err) {
        return generator.return(err);
      }
    }));
  }

  // Observable/Observer pair methods
  map2(projection) {
    return new MapObservable(this, projection);
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
    subscriptionReference.value = this._source.observer(new MapObserver(this._projection, generator, subscriptionReference));
    return subscriptionReference.value;
  }
}