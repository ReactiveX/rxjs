import {ImmediateDefinition} from '../../dist/cjs/util/Immediate';
import * as Rx from '../../dist/cjs/Rx';
import {it, DoneSignature} from '../helpers/test-helper';

declare const __root__: any;

describe('ImmediateDefinition', () => {
  it('should have setImmediate and clearImmediate methods', () => {
    const result = new ImmediateDefinition(__root__);
    expect(typeof result.setImmediate).toBe('function');
    expect(typeof result.clearImmediate).toBe('function');
  });

  describe('when setImmediate exists on root', () => {
    it('should use the setImmediate and clearImmediate methods from root', () => {
      let setImmediateCalled = false;
      let clearImmediateCalled = false;

      const root = {
        setImmediate: () => {
          setImmediateCalled = true;
        },
        clearImmediate: () => {
          clearImmediateCalled = true;
        }
      };

      const result = new ImmediateDefinition(root);

      result.setImmediate(() => {
        //noop
      });
      result.clearImmediate(null);

      expect(setImmediateCalled).toBeTruthy();
      expect(clearImmediateCalled).toBeTruthy();
    });
  });

  describe('prototype.createProcessNextTickSetImmediate()', () => {
    it('should create the proper flavor of setImmediate using process.nextTick', () => {
      const instance = {
        root: {
          process: {
            nextTick: jasmine.createSpy('nextTick')
          }
        },
        runIfPresent: () => {
          //noop
        },
        partiallyApplied: jasmine.createSpy('partiallyApplied'),
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createProcessNextTickSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(instance.addFromSetImmediateArguments).toHaveBeenCalled();
      expect(instance.partiallyApplied).toHaveBeenCalledWith(instance.runIfPresent, handle);
    });
  });

  describe('prototype.createPostMessageSetImmediate()', () => {
    it('should create the proper flavor of setImmediate using postMessage', () => {
      let addEventListenerCalledWith = null;

      const instance = {
        root: {
          addEventListener: (name: any, callback: any) => {
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

      const setImmediateImpl = ImmediateDefinition.prototype.createPostMessageSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');
      expect(addEventListenerCalledWith[0]).toBe('message');

      addEventListenerCalledWith[1]({ data: 'setImmediate$42$123456', source: instance.root });

      expect(instance.runIfPresent).toHaveBeenCalledWith(123456);

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(instance.addFromSetImmediateArguments).toHaveBeenCalled();
      expect(instance.root.postMessage).toHaveBeenCalledWith('setImmediate$42$123456', '*');
    });
  });

  describe('prototype.createMessageChannelSetImmediate', () => {
    it('should create the proper flavor of setImmediate that uses message channels', () => {
      const port1 = {};
      const port2 = {
        postMessage: jasmine.createSpy('MessageChannel.port2.postMessage')
      };

      function MockMessageChannel() {
        this.port1 = port1;
        this.port2 = port2;
      }

      const instance = {
        root: {
          MessageChannel: MockMessageChannel
        },
        runIfPresent: jasmine.createSpy('runIfPresent'),
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createMessageChannelSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');
      expect(typeof (<any>port1).onmessage).toBe('function');

      (<any>port1).onmessage({ data: 'something' });

      expect(instance.runIfPresent).toHaveBeenCalledWith('something');

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(port2.postMessage).toHaveBeenCalledWith(123456);
    });
  });

  describe('prototype.createReadyStateChangeSetImmediate', () => {
    it('should create the proper flavor of setImmediate that uses readystatechange on a DOM element', () => {
      const fakeScriptElement = {};

      const instance = {
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

      const setImmediateImpl = ImmediateDefinition.prototype.createReadyStateChangeSetImmediate.call(instance);

      expect(typeof setImmediateImpl).toBe('function');

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).toBe(123456);
      expect(instance.root.document.createElement).toHaveBeenCalledWith('script');
      expect(typeof (<any>fakeScriptElement).onreadystatechange).toBe('function');
      expect(instance.root.document.documentElement.appendChild).toHaveBeenCalledWith(fakeScriptElement);

      (<any>fakeScriptElement).onreadystatechange();

      expect(instance.runIfPresent).toHaveBeenCalledWith(handle);
      expect((<any>fakeScriptElement).onreadystatechange).toBe(null);
      expect(instance.root.document.documentElement.removeChild).toHaveBeenCalledWith(fakeScriptElement);
    });
  });

  describe('when setImmediate does *not* exist on root', () => {
    describe('when it can use process.nextTick', () => {
      it('should use the post message impl', () => {
        const nextTickImpl = () => {
          //noop
        };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createProcessNextTickSetImmediate').and.returnValue(nextTickImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createProcessNextTickSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(nextTickImpl);
      });
    });

    describe('when it cannot use process.nextTick', () => {
      it('should use the post message impl', () => {
        const postMessageImpl = () => {
          //noop
        };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createPostMessageSetImmediate').and.returnValue(postMessageImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createPostMessageSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(postMessageImpl);
      });
    });

    describe('when it cannot use process.nextTick or postMessage', () => {
      it('should use the readystatechange impl', () => {
        const messageChannelImpl = () => {
          //noop
        };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createMessageChannelSetImmediate').and.returnValue(messageChannelImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createMessageChannelSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(messageChannelImpl);
      });
    });

    describe('when it cannot use process.nextTick, postMessage or Message channels', () => {
      it('should use the readystatechange impl', () => {
        const readyStateChangeImpl = () => {
          //noop
        };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(true);
        spyOn(ImmediateDefinition.prototype, 'createReadyStateChangeSetImmediate').and.returnValue(readyStateChangeImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createReadyStateChangeSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(readyStateChangeImpl);
      });
    });

    describe('when no other methods to implement setImmediate are available', () => {
      it('should use the setTimeout impl', () => {
        const setTimeoutImpl = () => {
          //noop
        };
        spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
        spyOn(ImmediateDefinition.prototype, 'createSetTimeoutSetImmediate').and.returnValue(setTimeoutImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUsePostMessage).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseMessageChannel).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).toHaveBeenCalled();
        expect(ImmediateDefinition.prototype.createSetTimeoutSetImmediate).toHaveBeenCalled();
        expect(result.setImmediate).toBe(setTimeoutImpl);
      });
    });
  });

  describe('partiallyApplied', () => {
    describe('when passed a function as the first argument', () => {
      it('should return a function that takes no arguments and will be called with the passed arguments', () => {
        const fn = jasmine.createSpy('spy');
        const result = ImmediateDefinition.prototype.partiallyApplied(fn, 'arg1', 'arg2', 'arg3');

        expect(typeof result).toBe('function');
        expect(fn).not.toHaveBeenCalled();

        result();

        expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      });
    });

    describe('when passed a non-function as an argument', () => {
      it('should coerce to a string and convert to a function which will be called by the returned function', () => {
        __root__.__wasCalled = null;
        const fnStr = '__wasCalled = true;';
        const result = ImmediateDefinition.prototype.partiallyApplied(fnStr);

        expect(typeof result).toBe('function');

        result();

        expect(__root__.__wasCalled).toEqual(true);

        delete __root__.__wasCalled;
      });
    });
  });

  describe('prototype.identify', () => {
    it('should use Object.toString to return an identifier string', () => {
      function MockObject() {
        //noop
      }
      MockObject.prototype.toString = jasmine.createSpy('Object.prototype.toString').and.returnValue('[object HEYO!]');

      const instance = {
        root: {
          Object: MockObject
        }
      };

      const result = (<any>ImmediateDefinition).prototype.identify.call(instance);

      expect(result).toBe('[object HEYO!]');
    });
  });

  describe('prototype.canUseProcessNextTick', () => {
    describe('when root.process does not identify as [object process]', () => {
      it('should return false', () => {
        const instance = {
          root: {
            process: {}
          },
          identify: jasmine.createSpy('identify').and.returnValue('[object it-is-not-a-tumor]')
        };

        const result = ImmediateDefinition.prototype.canUseProcessNextTick.call(instance);

        expect(result).toBe(false);
        expect(instance.identify).toHaveBeenCalledWith(instance.root.process);
      });
    });

    describe('when root.process identifies as [object process]', () => {
      it('should return true', () => {
        const instance = {
          root: {
            process: {}
          },
          identify: jasmine.createSpy('identify').and.returnValue('[object process]')
        };

        const result = ImmediateDefinition.prototype.canUseProcessNextTick.call(instance);

        expect(result).toBe(true);
        expect(instance.identify).toHaveBeenCalledWith(instance.root.process);
      });
    });
  });

  describe('prototype.canUsePostMessage', () => {
    describe('when there is a global postMessage function', () => {
      describe('and importScripts does NOT exist', () => {
        it('should maintain any existing onmessage handler', () => {
          const originalOnMessage = () => {
            //noop
          };
          const instance = {
            root: {
              onmessage: originalOnMessage
            }
          };

          ImmediateDefinition.prototype.canUsePostMessage.call(instance);
          expect(instance.root.onmessage).toBe(originalOnMessage);
        });

        describe('and postMessage is synchronous', () => {
          it('should return false', () => {
            let postMessageCalled = false;
            const instance = {
              root: {
                postMessage: function () {
                  postMessageCalled = true;
                  this.onmessage();
                }
              }
            };

            const result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);
            expect(result).toBe(false);
            expect(postMessageCalled).toBe(true);
          });
        });

        describe('and postMessage is asynchronous', () => {
          it('should return true', () => {
            let postMessageCalled = false;
            const instance = {
              root: {
                postMessage: function () {
                  postMessageCalled = true;
                  const _onmessage = this.onmessage;
                  setTimeout(() => { _onmessage(); });
                }
              }
            };

            const result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);
            expect(result).toBe(true);
            expect(postMessageCalled).toBe(true);
          });
        });
      });

      describe('and importScripts *does* exist because it is a worker', () => {
        it('should return false', () => {
          const instance = {
            root: {
              postMessage: function () {
                //noop
              },
              importScripts: function () {
                //noop
              }
            }
          };

          const result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);
          expect(result).toBe(false);
        });
      });
    });

    describe('when there is NOT a global postMessage function', () => {
      it('should return false', () => {
        const instance = {
          root: {}
        };

        const result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);

        expect(result).toBe(false);
      });
    });
  });

  describe('prototype.canUseMessageChannel', () => {
    it('should return true if MessageChannel exists', () => {
      const instance = {
        root: {
          MessageChannel: function () {
            //noop
          }
        }
      };

      const result = ImmediateDefinition.prototype.canUseMessageChannel.call(instance);

      expect(result).toBe(true);
    });

    it('should return false if MessageChannel does NOT exist', () => {
      const instance = {
        root: {}
      };

      const result = ImmediateDefinition.prototype.canUseMessageChannel.call(instance);

      expect(result).toBe(false);
    });
  });

  describe('prototype.canUseReadyStateChange', () => {
    describe('when there is a document in global scope', () => {
      it('should return true if created script elements have an onreadystatechange property', () => {
        const fakeScriptElement = {
          onreadystatechange: null
        };

        const instance = {
          root: {
            document: {
              createElement: jasmine.createSpy('document.createElement').and.returnValue(fakeScriptElement)
            }
          }
        };

        const result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

        expect(result).toBe(true);
        expect(instance.root.document.createElement).toHaveBeenCalledWith('script');
      });

      it('should return false if created script elements do NOT have an onreadystatechange property', () => {
        const fakeScriptElement = {};

        const instance = {
          root: {
            document: {
              createElement: jasmine.createSpy('document.createElement').and.returnValue(fakeScriptElement)
            }
          }
        };

        const result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

        expect(result).toBe(false);
        expect(instance.root.document.createElement).toHaveBeenCalledWith('script');
      });
    });

    it('should return false if there is no document in global scope', () => {
      const instance = {
        root: {}
      };

      const result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

      expect(result).toBe(false);
    });
  });

  describe('prototype.addFromSetImmediateArguments', () => {
    it('should add to tasksByHandle and increment the nextHandle', () => {
      const partiallyAppliedResult = {};

      const instance = {
        tasksByHandle: {},
        nextHandle: 42,
        partiallyApplied: jasmine.createSpy('partiallyApplied').and.returnValue(partiallyAppliedResult)
      };

      const args = [() => {
        //noop
      }, 'foo', 'bar'];

      const handle = ImmediateDefinition.prototype.addFromSetImmediateArguments.call(instance, args);

      expect(handle).toBe(42);
      expect(instance.nextHandle).toBe(43);
      expect(instance.tasksByHandle[42]).toBe(partiallyAppliedResult);
    });
  });

  describe('clearImmediate', () => {
    it('should delete values from tasksByHandle', () => {
      const setTimeoutImpl = () => {
        //noop
      };
      spyOn(ImmediateDefinition.prototype, 'canUseProcessNextTick').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'canUsePostMessage').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'canUseMessageChannel').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'canUseReadyStateChange').and.returnValue(false);
      spyOn(ImmediateDefinition.prototype, 'createSetTimeoutSetImmediate').and.returnValue(setTimeoutImpl);

      const Immediate = new ImmediateDefinition({});
      Immediate.tasksByHandle[123456] = () => {
        //noop
      };

      expect('123456' in Immediate.tasksByHandle).toBe(true);

      Immediate.clearImmediate(123456);

      expect('123456' in Immediate.tasksByHandle).toBe(false);
    });
  });

  describe('prototype.runIfPresent', () => {
    it('should delay running the task if it is currently running a task', () => {
      const mockApplied = () => {
        //noop
      };

      const instance = {
        root: {
          setTimeout: jasmine.createSpy('setTimeout'),
          Object: Object
        },
        currentlyRunningATask: true,
        partiallyApplied: jasmine.createSpy('partiallyApplied').and.returnValue(mockApplied)
      };

      ImmediateDefinition.prototype.runIfPresent.call(instance, 123456);

      expect(instance.partiallyApplied).toHaveBeenCalledWith((<any>instance).runIfPresent, 123456);
      expect(instance.root.setTimeout).toHaveBeenCalledWith(mockApplied, 0);
    });

    it('should not error if there is no task currently running and the handle passed is not found', () => {
      expect(() => {
        const instance = {
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

    describe('when a task is found for the handle', () => {
      it('should execute the task and clean up after', () => {
        const instance = {
          root: {
            setTimeout: jasmine.createSpy('setTimeout'),
            Object: Object
          },
          currentlyRunningATask: false,
          tasksByHandle: {},
          clearImmediate: jasmine.createSpy('clearImmediate')
        };

        instance.tasksByHandle[123456] = jasmine.createSpy('task').and.callFake(() => {
          expect(instance.currentlyRunningATask).toBe(true);
        });

        ImmediateDefinition.prototype.runIfPresent.call(instance, 123456);
        expect(instance.clearImmediate).toHaveBeenCalledWith(123456);
      });
    });
  });

  describe('prototype.createSetTimeoutSetImmediate', () => {
    it('should create a proper setImmediate implementation that uses setTimeout', () => {
      const mockApplied = () => {
        //noop
      };

      const instance = {
        root: {
          setTimeout: jasmine.createSpy('setTimeout')
        },
        addFromSetImmediateArguments: jasmine.createSpy('addFromSetImmediateArguments').and.returnValue(123456),
        runIfPresent: function () {
          //noop
        },
        partiallyApplied: jasmine.createSpy('partiallyApplied').and.returnValue(mockApplied)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createSetTimeoutSetImmediate.call(instance);

      const handle = setImmediateImpl();

      expect(handle).toBe(123456);
      expect(instance.addFromSetImmediateArguments).toHaveBeenCalled();
      expect(instance.root.setTimeout).toHaveBeenCalledWith(mockApplied, 0);
    });
  });

  describe('integration test', () => {
    it('should work', (done: DoneSignature) => {
      const results = [];
      Rx.Observable.fromArray([1, 2, 3], Rx.Scheduler.asap)
        .subscribe((x: number) => {
          results.push(x);
        }, done.fail,
        () => {
          expect(results).toEqual([1, 2, 3]);
          done();
        });
    });
  });
});