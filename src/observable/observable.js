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
      var subscription;
      subscription = self.observer(generatorTransform.call(this, {
        next(value) {
          var iterationResult = generator.next(value);
          if(typeof iterationResult !== 'undefined' && iterationResult.done) {
            subscription.dispose();
          }
          return iterationResult;
        },
        
        throw(err) {
          subscription.dispose();
          var _throw = generator.throw;
          if(_throw) {
            return _throw.call(this, err);
          }
        },
        
        return(value) {
          subscription.dispose();
          var ret = generator.return;
          if(ret) {
            return ret.call(this, value);
          }
        }
      }));
      
      return subscription;
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
}