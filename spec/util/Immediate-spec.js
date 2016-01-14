var ImmediateDefinition = require('../../dist/cjs/util/Immediate').ImmediateDefinition;
var Rx = require('../../dist/cjs/Rx');

describe('ImmediateDefinition', function () {
  it('should have setImmediate and clearImmediate methods', function () {
    var result = new ImmediateDefinition(__root__);
    expect(typeof result.setImmediate).toBe('function');
    expect(typeof result.clearImmediate).toBe('function');
  });

  describe('when setImmediate exists on root', function () {
    it('should use the setImmediate and clearImmediate methods from root', function () {
      var setImmediateCalled = false;
      var clearImmediateCalled = false;

      var root = {
        setImmediate: function () {
          setImmediateCalled = true;
        },
        clearImmediate: function () {
          clearImmediateCalled = true;
        }
      };

      var result = new ImmediateDefinition(root);

      result.setImmediate(function () {});
      result.clearImmediate();

      expect(setImmediateCalled).toBeTruthy();
      expect(clearImmediateCalled).toBeTruthy();
    });
  });

  describe('prototype.createProcessNextTickSetImmediate()', function () {
    it('should create the proper flavor of setImmediate using process.nextTick', function () {
      var instance = {
        root: {
          process: {
            nextTick: jasmine.createSpy('nextTick')
          }
        },
        runIfPresent: function () {},
        partiallyApplied: jasmine.createSpy('partiallyApplied'),
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456)
      };

      var setImmediateImpl = ImmediateDefinition.prototype.createProcessNextTickSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');

      var action = function () {};
      var handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(instance.addFromSetImmediateArguments).toHaveBeenCalled();
      expect(instance.partiallyApplied).toHaveBeenCalledWith(instance.runIfPresent, handle);
    });
  });

  describe('prototype.createPostMessageSetImmediate()', function () {
    it('should create the proper flavor of setImmediate using postMessage', function () {
      var addEventListenerCalledWith = null;

      var instance = {
        root: {
          addEventListener: function (name, callback) {
            addEventListenerCalledWith = [name, callback];
          },
          postMessage: jasmine.createSpy('root.postMessage'),
          Math: {
            random: jasmine.createSpy('Math.random').and.returnValue(42)
          }
        },
        runIfPresent: jasmine.createSpy('runIfPresent'),
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456)
      };

      var setImmediateImpl = ImmediateDefinition.prototype.createPostMessageSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');
      expect(addEventListenerCalledWith[0]).toBe('message');

      addEventListenerCalledWith[1]({ data: 'setImmediate$42$123456', source: instance.root });

      expect(instance.runIfPresent).toHaveBeenCalledWith(123456);

      var action = function () {};
      var handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(instance.addFromSetImmediateArguments).toHaveBeenCalled();
      expect(instance.root.postMessage).toHaveBeenCalledWith('setImmediate$42$123456', '*');
    });
  });

  describe('prototype.createMessageChannelSetImmediate', function () {
    it('should create the proper flavor of setImmediate that uses message channels', function () {
      var port1 = {};
      var port2 = {
        postMessage: jasmine.createSpy('MessageChannel.port2.postMessage')
      };

      function MockMessageChannel() {
        this.port1 = port1;
        this.port2 = port2;
      }

      var instance = {
        root: {
          MessageChannel: MockMessageChannel
        },
        runIfPresent: jasmine.createSpy('runIfPresent'),
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456)
      };

      var setImmediateImpl = ImmediateDefinition.prototype.createMessageChannelSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');
      expect(typeof port1.onmessage).toBe('function');

      port1.onmessage({ data: 'something' });

      expect(instance.runIfPresent).toHaveBeenCalledWith('something');

      var action = function () {};
      var handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(port2.postMessage).toHaveBeenCalledWith(123456);
    });
  });

  describe('prototype.createReadyStateChangeSetImmediate', function () {
    it('should create the proper flavor of setImmediate that uses readystatechange on a DOM element', function () {
      var fakeScriptElement = {};

      var instance = {
        root: {
          document: {
            createElement: jasmine.createSpy('document.createElement').and.returnValue(fakeScriptElement),
            documentElement: {
              appendChild: jasmine.createSpy('documentElement.appendChild'),
              removeChild: jasmine.createSpy('documentElement.removeChild')
            }
          }
        },
        runIfPresent: jasmine.createSpy('runIfPresent'),
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456)
      };

      var setImmediateImpl = ImmediateDefinition.prototype.createReadyStateChangeSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');

      var action = function () {};
      var handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(instance.root.document.createElement).toHaveBeenCalledWith('script');
      expect(typeof fakeScriptElement.onreadystatechange).toBe('function');
      expect(instance.root.document.documentElement.appendChild).toHaveBeenCalledWith(fakeScriptElement);

      fakeScriptElement.onreadystatechange();

      expect(instance.runIfPresent).toHaveBeenCalledWith(handle);
      expect(fakeScriptElement.onreadystatechange).toBe(null);
      expect(instance.root.document.documentElement.removeChild).toHaveBeenCalledWith(fakeScriptElement);
    });
  });

  describe('when setImmediate does *not* exist on root', function () {
    describe('when it can use process.nextTick', function () {
      it('should use the post message impl', function () {
        var nextTickImpl = function () { };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createProcessNextTickSetImmediate').and.returnValue(nextTickImpl);

        var result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createProcessNextTickSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(nextTickImpl);
      });
    });

    describe('when it cannot use process.nextTick', function () {
      it('should use the post message impl', function () {
        var postMessageImpl = function () { };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createPostMessageSetImmediate').and.returnValue(postMessageImpl);

        var result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createPostMessageSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(postMessageImpl);
      });
    });

    describe('when it cannot use process.nextTick or postMessage', function () {
      it('should use the readystatechange impl', function () {
        var messageChannelImpl = function () { };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createMessageChannelSetImmediate').and.returnValue(messageChannelImpl);

        var result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createMessageChannelSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(messageChannelImpl);
      });
    });

    describe('when it cannot use process.nextTick, postMessage or Message channels', function () {
      it('should use the readystatechange impl', function () {
        var readyStateChangeImpl = function () { };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'createReadyStateChangeSetImmediate').and.returnValue(readyStateChangeImpl);

        var result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createReadyStateChangeSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(readyStateChangeImpl);
      });
    });

    describe('when no other methods to implement setImmediate are available', function () {
      it('should use the setTimeout impl', function () {
        var setTimeoutImpl = function () { };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createSetTimeoutSetImmediate').and.returnValue(setTimeoutImpl);

        var result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createSetTimeoutSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(setTimeoutImpl);
      });
    });
  });

  describe('partiallyApplied', function () {
    describe('when passed a function as the first argument', function () {
      it('should return a function that takes no arguments and will be called with the passed arguments', function () {
        var fn = jasmine.createSpy('spy');
        var result = ImmediateDefinition.prototype.partiallyApplied(fn, 'arg1', 'arg2', 'arg3');

        expect(typeof result).toBe('function');
        expect(fn).not.toHaveBeenCalled();

        result();

        expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      });
    });

    describe('when passed a non-function as an argument', function () {
      it('should coerce to a string and convert to a function which will be called by the returned function', function () {
        __root__.__wasCalled = null;
        var fnStr = '__wasCalled = true;';
        var result = ImmediateDefinition.prototype.partiallyApplied(fnStr);

        expect(typeof result).toBe('function');

        var calledWith = result();

        expect(__root__.__wasCalled).toEqual(true);

        delete __root__.__wasCalled;
      });
    });
  });

  describe('prototype.identify', function () {
    it('should use Object.toString to return an identifier string', function () {
      function MockObject() {
      }
      MockObject.prototype.toString = jasmine.createSpy('Object.prototype.toString').and.returnValue('[object HEYO!]');

      var instance = {
        root: {
          Object: MockObject
        }
      };

      var result = ImmediateDefinition.prototype.identify.call(instance);

      expect(result).toBe('[object HEYO!]');
    });
  });

  describe('prototype.canUseProcessNextTick', function () {
    describe('when root.process does not identify as [object process]', function () {
      it('should return false', function () {
        var instance = {
          root: {
            process: {}
          },
          identify: jasmine.createSpy('identify').and.returnValue('[object it-is-not-a-tumor]')
        };

        var result = ImmediateDefinition.prototype.canUseProcessNextTick.call(instance);

        expect(result).toBe(false);
        expect(instance.identify).toHaveBeenCalledWith(instance.root.process);
      });
    });

    describe('when root.process identifies as [object process]', function () {
      it('should return true', function () {
        var instance = {
          root: {
            process: {}
          },
          identify: jasmine.createSpy('identify').and.returnValue('[object process]')
        };

        var result = ImmediateDefinition.prototype.canUseProcessNextTick.call(instance);

        expect(result).toBe(true);
        expect(instance.identify).toHaveBeenCalledWith(instance.root.process);
      });
    });
  });

  describe('prototype.canUsePostMessage', function () {
    describe('when there is a global postMessage function', function () {
      describe('and importScripts does NOT exist', function () {
        it('should maintain any existing onmessage handler', function () {
          var originalOnMessage = function () {};
          var instance = {
            root: {
              onmessage: originalOnMessage
            }
          };

          ImmediateDefinition.prototype.canUsePostMessage.call(instance);
          expect(instance.root.onmessage).toBe(originalOnMessage);
        });

        describe('and postMessage is synchronous', function () {
          it('should return false', function () {
            var postMessageCalled = false;
            var instance = {
              root: {
                postMessage: function () {
                  postMessageCalled = true;
                  this.onmessage();
                }
              }
            };

            var result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);
            expect(result).toBe(false);
            expect(postMessageCalled).toBe(true);
          });
        });

        describe('and postMessage is asynchronous', function () {
          it('should return true', function () {
            var postMessageCalled = false;
            var instance = {
              root: {
                postMessage: function () {
                  postMessageCalled = true;
                  var _onmessage = this.onmessage;
                  setTimeout(function () { _onmessage(); });
                }
              }
            };

            var result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);
            expect(result).toBe(true);
            expect(postMessageCalled).toBe(true);
          });
        });
      });

      describe('and importScripts *does* exist because it is a worker', function () {
        it('should return false', function () {
          var instance = {
            root: {
              postMessage: function () {},
              importScripts: function () {}
            }
          };

          var result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);
          expect(result).toBe(false);
        });
      });
    });

    describe('when there is NOT a global postMessage function', function () {
      it('should return false', function () {
        var instance = {
          root: {}
        };

        var result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);

        expect(result).toBe(false);
      });
    });
  });

  describe('prototype.canUseMessageChannel', function () {
    it('should return true if MessageChannel exists', function () {
      var instance = {
        root: {
          MessageChannel: function () {}
        }
      };

      var result = ImmediateDefinition.prototype.canUseMessageChannel.call(instance);

      expect(result).toBe(true);
    });

    it('should return false if MessageChannel does NOT exist', function () {
      var instance = {
        root: {}
      };

      var result = ImmediateDefinition.prototype.canUseMessageChannel.call(instance);

      expect(result).toBe(false);
    });
  });

  describe('prototype.canUseReadyStateChange', function () {
    describe('when there is a document in global scope', function () {
      it('should return true if created script elements have an onreadystatechange property', function () {
        var fakeScriptElement = {
          onreadystatechange: null
        };

        var instance = {
          root: {
            document: {
              createElement: jasmine.createSpy('document.createElement').and.returnValue(fakeScriptElement)
            }
          }
        };

        var result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

        expect(result).toBe(true);
        expect(instance.root.document.createElement).toHaveBeenCalledWith('script');
      });

      it('should return false if created script elements do NOT have an onreadystatechange property', function () {
        var fakeScriptElement = {};

        var instance = {
          root: {
            document: {
              createElement: jasmine.createSpy('document.createElement').and.returnValue(fakeScriptElement)
            }
          }
        };

        var result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

        expect(result).toBe(false);
        expect(instance.root.document.createElement).toHaveBeenCalledWith('script');
      });
    });

    it('should return false if there is no document in global scope', function () {
      var instance = {
        root: {}
      };

      var result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

      expect(result).toBe(false);
    });
  });

  describe('prototype.addFromSetImmediateArguments', function () {
    it('should add to tasksByHandle and increment the nextHandle', function () {
      var partiallyAppliedResult = {};

      var instance = {
        tasksByHandle: {},
        nextHandle: 42,
        partiallyApplied: jasmine.createSpy('partiallyApplied').and.returnValue(partiallyAppliedResult)
      };

      var args = [function () {}, 'foo', 'bar'];

      var handle = ImmediateDefinition.prototype.addFromSetImmediateArguments.call(instance, args);

      expect(handle).toBe(42);
      expect(instance.nextHandle).toBe(43);
      expect(instance.tasksByHandle[42]).toBe(partiallyAppliedResult);
    });
  });

  describe('clearImmediate', function () {
    it('should delete values from tasksByHandle', function () {
      var setTimeoutImpl = function () { };
      spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'createSetTimeoutSetImmediate').and.returnValue(setTimeoutImpl);

      var Immediate = new ImmediateDefinition({});
      Immediate.tasksByHandle[123456] = function () {};

      expect('123456' in Immediate.tasksByHandle).toBe(true);

      Immediate.clearImmediate(123456);

      expect('123456' in Immediate.tasksByHandle).toBe(false);
    });
  });

  describe('prototype.runIfPresent', function () {
    it('should delay running the task if it is currently running a task', function () {
      var mockApplied = function () {};

      var instance = {
        root: {
          setTimeout: jasmine.createSpy('setTimeout'),
          Object: Object
        },
        currentlyRunningATask: true,
        partiallyApplied: jasmine.createSpy('partiallyApplied').and.returnValue(mockApplied)
      };

      ImmediateDefinition.prototype.runIfPresent.call(instance, 123456);

      expect(instance.partiallyApplied).toHaveBeenCalledWith(instance.runIfPresent, 123456);
      expect(instance.root.setTimeout).toHaveBeenCalledWith(mockApplied, 0);
    });

    it('should not error if there is no task currently running and the handle passed is not found', function () {
      expect(function () {
        var instance = {
          root: {
            setTimeout: jasmine.createSpy('setTimeout'),
            Object: Object
          },
          currentlyRunningATask: false,
          tasksByHandle: {}
        };

        ImmediateDefinition.prototype.runIfPresent.call(instance, 888888);
      }).not.toThrow();
    });

    describe('when a task is found for the handle', function () {
      it('should execute the task and clean up after', function () {
        var instance = {
          root: {
            setTimeout: jasmine.createSpy('setTimeout'),
            Object: Object
          },
          currentlyRunningATask: false,
          tasksByHandle: {},
          clearImmediate: jasmine.createSpy('clearImmediate')
        };

        instance.tasksByHandle[123456] = jasmine.createSpy('task').and.callFake(function () {
          expect(instance.currentlyRunningATask).toBe(true);
        });

        ImmediateDefinition.prototype.runIfPresent.call(instance, 123456);
        expect(instance.clearImmediate).toHaveBeenCalledWith(123456);
      });
    });
  });

  describe('prototype.createSetTimeoutSetImmediate', function () {
    it('should create a proper setImmediate implementation that uses setTimeout', function () {
      var mockApplied = function () {};

      var instance = {
        root: {
          setTimeout: jasmine.createSpy('setTimeout')
        },
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456),
        runIfPresent: function () {},
        partiallyApplied: jasmine.createSpy('partiallyApplied').and.returnValue(mockApplied)
      };

      var setImmediateImpl = ImmediateDefinition.prototype.createSetTimeoutSetImmediate.call(instance);

      var handle = setImmediateImpl();

      expect(handle).toBe(123456);
      expect(instance.addFromSetImmediateArguments).toHaveBeenCalled();
      expect(instance.root.setTimeout).toHaveBeenCalledWith(mockApplied, 0);
    });
  });

  describe('integration test', function () {
    it('should work', function (done) {
      var results = [];
      Rx.Observable.fromArray([1, 2, 3], Rx.Scheduler.nextTick)
        .subscribe(function (x) {
          results.push(x);
        }, done.throw,
        function () {
          expect(results).toEqual([1,2,3]);
          done();
        });
    });
  });
});