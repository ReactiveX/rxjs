import {expect} from 'chai';
import * as sinon from 'sinon';
import {ImmediateDefinition} from '../../dist/cjs/util/Immediate';
import * as Rx from '../../dist/cjs/Rx';

declare const __root__: any;

/** @test {ImmediateDefinition} */
describe('ImmediateDefinition', () => {
  let sandbox;
  beforeEach(function () {
      sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
      sandbox.restore();
  });

  it('should have setImmediate and clearImmediate methods', () => {
    const result = new ImmediateDefinition(__root__);
    expect(result.setImmediate).to.be.a('function');
    expect(result.clearImmediate).to.be.a('function');
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

      expect(setImmediateCalled).to.be.ok;
      expect(clearImmediateCalled).to.be.ok;
    });
  });

  describe('prototype.createProcessNextTickSetImmediate()', () => {
    it('should create the proper flavor of setImmediate using process.nextTick', () => {
      const instance = {
        root: {
          process: {
            nextTick: sinon.spy()
          }
        },
        runIfPresent: () => {
          //noop
        },
        partiallyApplied: sinon.spy(),
        addFromSetImmediateArguments: sinon.stub().returns(123456)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createProcessNextTickSetImmediate.call(instance);

      expect(setImmediateImpl).to.be.a('function');

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).to.equal(123456);
      expect(instance.addFromSetImmediateArguments).have.been.called;
      expect(instance.partiallyApplied).have.been.calledWith(instance.runIfPresent, handle);
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
          postMessage: sinon.spy(),
          Math: {
            random: sinon.stub().returns(42)
          }
        },
        runIfPresent: sinon.spy(),
        addFromSetImmediateArguments: sinon.stub().returns(123456)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createPostMessageSetImmediate.call(instance);

      expect(setImmediateImpl).to.be.a('function');
      expect(addEventListenerCalledWith[0]).to.equal('message');

      addEventListenerCalledWith[1]({ data: 'setImmediate$42$123456', source: instance.root });

      expect(instance.runIfPresent).have.been.calledWith(123456);

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).to.equal(123456);
      expect(instance.addFromSetImmediateArguments).have.been.called;
      expect(instance.root.postMessage).have.been.calledWith('setImmediate$42$123456', '*');
    });
  });

  describe('prototype.createMessageChannelSetImmediate', () => {
    it('should create the proper flavor of setImmediate that uses message channels', () => {
      const port1 = {};
      const port2 = {
        postMessage: sinon.spy()
      };

      function MockMessageChannel() {
        this.port1 = port1;
        this.port2 = port2;
      }

      const instance = {
        root: {
          MessageChannel: MockMessageChannel
        },
        runIfPresent: sinon.spy(),
        addFromSetImmediateArguments: sinon.stub().returns(123456)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createMessageChannelSetImmediate.call(instance);

      expect(setImmediateImpl).to.be.a('function');
      expect((<any>port1).onmessage).to.be.a('function');

      (<any>port1).onmessage({ data: 'something' });

      expect(instance.runIfPresent).have.been.calledWith('something');

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).to.equal(123456);
      expect(port2.postMessage).have.been.calledWith(123456);
    });
  });

  describe('prototype.createReadyStateChangeSetImmediate', () => {
    it('should create the proper flavor of setImmediate that uses readystatechange on a DOM element', () => {
      const fakeScriptElement = {};

      const instance = {
        root: {
          document: {
            createElement: sinon.stub().returns(fakeScriptElement),
            documentElement: {
              appendChild: sinon.spy(),
              removeChild: sinon.spy(),
            }
          }
        },
        runIfPresent: sinon.spy(),
        addFromSetImmediateArguments: sinon.stub().returns(123456)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createReadyStateChangeSetImmediate.call(instance);

      expect(setImmediateImpl).to.be.a('function');

      const action = () => {
        //noop
      };
      const handle = setImmediateImpl(action);

      expect(handle).to.equal(123456);
      expect(instance.root.document.createElement).have.been.calledWith('script');
      expect((<any>fakeScriptElement).onreadystatechange).to.be.a('function');
      expect(instance.root.document.documentElement.appendChild).have.been.calledWith(fakeScriptElement);

      (<any>fakeScriptElement).onreadystatechange();

      expect(instance.runIfPresent).have.been.calledWith(handle);
      expect((<any>fakeScriptElement).onreadystatechange).to.be.a('null');
      expect(instance.root.document.documentElement.removeChild).have.been.calledWith(fakeScriptElement);
    });
  });

  describe('when setImmediate does *not* exist on root', () => {
    describe('when it can use process.nextTick', () => {
      it('should use the post message impl', () => {
        const nextTickImpl = () => {
          //noop
        };
        sandbox.stub(ImmediateDefinition.prototype, 'canUseProcessNextTick').returns(true);
        sandbox.stub(ImmediateDefinition.prototype, 'canUsePostMessage').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseMessageChannel').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseReadyStateChange').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'createProcessNextTickSetImmediate').returns(nextTickImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).have.been.called;
        expect(ImmediateDefinition.prototype.canUsePostMessage).not.have.been.called;
        expect(ImmediateDefinition.prototype.canUseMessageChannel).not.have.been.called;
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.have.been.called;
        expect(ImmediateDefinition.prototype.createProcessNextTickSetImmediate).have.been.called;
        expect(result.setImmediate).to.equal(nextTickImpl);
      });
    });

    describe('when it cannot use process.nextTick', () => {
      it('should use the post message impl', () => {
        const postMessageImpl = () => {
          //noop
        };
        sandbox.stub(ImmediateDefinition.prototype, 'canUseProcessNextTick').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUsePostMessage').returns(true);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseMessageChannel').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseReadyStateChange').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'createPostMessageSetImmediate').returns(postMessageImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).have.been.called;
        expect(ImmediateDefinition.prototype.canUsePostMessage).have.been.called;
        expect(ImmediateDefinition.prototype.canUseMessageChannel).not.have.been.called;
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.have.been.called;
        expect(ImmediateDefinition.prototype.createPostMessageSetImmediate).have.been.called;
        expect(result.setImmediate).to.equal(postMessageImpl);
      });
    });

    describe('when it cannot use process.nextTick or postMessage', () => {
      it('should use the readystatechange impl', () => {
        const messageChannelImpl = () => {
          //noop
        };
        sandbox.stub(ImmediateDefinition.prototype, 'canUseProcessNextTick').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUsePostMessage').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseMessageChannel').returns(true);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseReadyStateChange').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'createMessageChannelSetImmediate').returns(messageChannelImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).have.been.called;
        expect(ImmediateDefinition.prototype.canUsePostMessage).have.been.called;
        expect(ImmediateDefinition.prototype.canUseMessageChannel).have.been.called;
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).not.have.been.called;
        expect(ImmediateDefinition.prototype.createMessageChannelSetImmediate).have.been.called;
        expect(result.setImmediate).to.equal(messageChannelImpl);
      });
    });

    describe('when it cannot use process.nextTick, postMessage or Message channels', () => {
      it('should use the readystatechange impl', () => {
        const readyStateChangeImpl = () => {
          //noop
        };
        sandbox.stub(ImmediateDefinition.prototype, 'canUseProcessNextTick').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUsePostMessage').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseMessageChannel').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseReadyStateChange').returns(true);
        sandbox.stub(ImmediateDefinition.prototype, 'createReadyStateChangeSetImmediate').returns(readyStateChangeImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).have.been.called;
        expect(ImmediateDefinition.prototype.canUsePostMessage).have.been.called;
        expect(ImmediateDefinition.prototype.canUseMessageChannel).have.been.called;
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).have.been.called;
        expect(ImmediateDefinition.prototype.createReadyStateChangeSetImmediate).have.been.called;
        expect(result.setImmediate).to.equal(readyStateChangeImpl);
      });
    });

    describe('when no other methods to implement setImmediate are available', () => {
      it('should use the setTimeout impl', () => {
        const setTimeoutImpl = () => {
          //noop
        };
        sandbox.stub(ImmediateDefinition.prototype, 'canUseProcessNextTick').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUsePostMessage').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseMessageChannel').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'canUseReadyStateChange').returns(false);
        sandbox.stub(ImmediateDefinition.prototype, 'createSetTimeoutSetImmediate').returns(setTimeoutImpl);

        const result = new ImmediateDefinition({});
        expect(ImmediateDefinition.prototype.canUseProcessNextTick).have.been.called;
        expect(ImmediateDefinition.prototype.canUsePostMessage).have.been.called;
        expect(ImmediateDefinition.prototype.canUseMessageChannel).have.been.called;
        expect(ImmediateDefinition.prototype.canUseReadyStateChange).have.been.called;
        expect(ImmediateDefinition.prototype.createSetTimeoutSetImmediate).have.been.called;
        expect(result.setImmediate).to.equal(setTimeoutImpl);
      });
    });
  });

  describe('partiallyApplied', () => {
    describe('when passed a function as the first argument', () => {
      it('should return a function that takes no arguments and will be called with the passed arguments', () => {
        const fn = sinon.spy();
        const result = ImmediateDefinition.prototype.partiallyApplied(fn, 'arg1', 'arg2', 'arg3');

        expect(result).to.be.a('function');
        expect(fn).not.have.been.called;

        result();

        expect(fn).have.been.calledWith('arg1', 'arg2', 'arg3');
      });
    });

    describe('when passed a non-function as an argument', () => {
      it('should coerce to a string and convert to a function which will be called by the returned function', () => {
        __root__.__wasCalled = null;
        const fnStr = '__wasCalled = true;';
        const result = ImmediateDefinition.prototype.partiallyApplied(fnStr);

        expect(result).to.be.a('function');

        result();

        expect(__root__.__wasCalled).to.be.true;

        delete __root__.__wasCalled;
      });
    });
  });

  describe('prototype.identify', () => {
    it('should use Object.toString to return an identifier string', () => {
      function MockObject() {
        //noop
      }
      sandbox.stub(MockObject.prototype, 'toString').returns('[object HEYO!]');

      const instance = {
        root: {
          Object: MockObject
        }
      };

      const result = (<any>ImmediateDefinition).prototype.identify.call(instance);

      expect(result).to.equal('[object HEYO!]');
    });
  });

  describe('prototype.canUseProcessNextTick', () => {
    describe('when root.process does not identify as [object process]', () => {
      it('should return false', () => {
        const instance = {
          root: {
            process: {}
          },
          identify: sinon.stub().returns('[object it-is-not-a-tumor]')
        };

        const result = ImmediateDefinition.prototype.canUseProcessNextTick.call(instance);

        expect(result).to.be.false;
        expect(instance.identify).have.been.calledWith(instance.root.process);
      });
    });

    describe('when root.process identifies as [object process]', () => {
      it('should return true', () => {
        const instance = {
          root: {
            process: {}
          },
          identify: sinon.stub().returns('[object process]')
        };

        const result = ImmediateDefinition.prototype.canUseProcessNextTick.call(instance);

        expect(result).to.be.true;
        expect(instance.identify).have.been.calledWith(instance.root.process);
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
          expect(instance.root.onmessage).to.equal(originalOnMessage);
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
            expect(result).to.be.false;
            expect(postMessageCalled).to.be.true;
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
            expect(result).to.be.true;
            expect(postMessageCalled).to.be.true;
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
          expect(result).to.be.false;
        });
      });
    });

    describe('when there is NOT a global postMessage function', () => {
      it('should return false', () => {
        const instance = {
          root: {}
        };

        const result = ImmediateDefinition.prototype.canUsePostMessage.call(instance);

        expect(result).to.be.false;
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

      expect(result).to.be.true;
    });

    it('should return false if MessageChannel does NOT exist', () => {
      const instance = {
        root: {}
      };

      const result = ImmediateDefinition.prototype.canUseMessageChannel.call(instance);

      expect(result).to.be.false;
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
              createElement: sinon.stub().returns(fakeScriptElement)
            }
          }
        };

        const result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

        expect(result).to.be.true;
        expect(instance.root.document.createElement).have.been.calledWith('script');
      });

      it('should return false if created script elements do NOT have an onreadystatechange property', () => {
        const fakeScriptElement = {};

        const instance = {
          root: {
            document: {
              createElement: sinon.stub().returns(fakeScriptElement)
            }
          }
        };

        const result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

        expect(result).to.be.false;
        expect(instance.root.document.createElement).have.been.calledWith('script');
      });
    });

    it('should return false if there is no document in global scope', () => {
      const instance = {
        root: {}
      };

      const result = ImmediateDefinition.prototype.canUseReadyStateChange.call(instance);

      expect(result).to.be.false;
    });
  });

  describe('prototype.addFromSetImmediateArguments', () => {
    it('should add to tasksByHandle and increment the nextHandle', () => {
      const partiallyAppliedResult = {};

      const instance = {
        tasksByHandle: {},
        nextHandle: 42,
        partiallyApplied: sinon.stub().returns(partiallyAppliedResult)
      };

      const args = [() => {
        //noop
      }, 'foo', 'bar'];

      const handle = ImmediateDefinition.prototype.addFromSetImmediateArguments.call(instance, args);

      expect(handle).to.equal(42);
      expect(instance.nextHandle).to.equal(43);
      expect(instance.tasksByHandle[42]).to.equal(partiallyAppliedResult);
    });
  });

  describe('clearImmediate', () => {
    it('should delete values from tasksByHandle', () => {
      const setTimeoutImpl = () => {
        //noop
      };
      sandbox.stub(ImmediateDefinition.prototype, 'canUseProcessNextTick').returns(false);
      sandbox.stub(ImmediateDefinition.prototype, 'canUsePostMessage').returns(false);
      sandbox.stub(ImmediateDefinition.prototype, 'canUseMessageChannel').returns(false);
      sandbox.stub(ImmediateDefinition.prototype, 'canUseReadyStateChange').returns(false);
      sandbox.stub(ImmediateDefinition.prototype, 'createSetTimeoutSetImmediate').returns(setTimeoutImpl);

      const Immediate = new ImmediateDefinition({});
      Immediate.tasksByHandle[123456] = () => {
        //noop
      };

      expect('123456' in Immediate.tasksByHandle).to.be.true;

      Immediate.clearImmediate(123456);

      expect('123456' in Immediate.tasksByHandle).to.be.false;
    });
  });

  describe('prototype.runIfPresent', () => {
    it('should delay running the task if it is currently running a task', () => {
      const mockApplied = () => {
        //noop
      };

      const instance = {
        root: {
          setTimeout: sinon.spy(),
          Object: Object
        },
        currentlyRunningATask: true,
        partiallyApplied: sinon.stub().returns(mockApplied)
      };

      ImmediateDefinition.prototype.runIfPresent.call(instance, 123456);

      expect(instance.partiallyApplied).have.been.calledWith((<any>instance).runIfPresent, 123456);
      expect(instance.root.setTimeout).have.been.calledWith(mockApplied, 0);
    });

    it('should not error if there is no task currently running and the handle passed is not found', () => {
      expect(() => {
        const instance = {
          root: {
            setTimeout: sinon.spy(),
            Object: Object
          },
          currentlyRunningATask: false,
          tasksByHandle: {}
        };

        ImmediateDefinition.prototype.runIfPresent.call(instance, 888888);
      }).not.to.throw();
    });

    describe('when a task is found for the handle', () => {
      it('should execute the task and clean up after', () => {
        const instance = {
          root: {
            setTimeout: sinon.spy(),
            Object: Object
          },
          currentlyRunningATask: false,
          tasksByHandle: {},
          clearImmediate: sinon.spy()
        };

        const spy = sinon.stub();

        spy({
          task: function () {
            expect(instance.currentlyRunningATask).to.be.true;
          }
        });
        instance.tasksByHandle[123456] = spy;

        ImmediateDefinition.prototype.runIfPresent.call(instance, 123456);
        expect(instance.clearImmediate).have.been.calledWith(123456);
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
          setTimeout: sinon.spy()
        },
        addFromSetImmediateArguments: sinon.stub().returns(123456),
        runIfPresent: function () {
          //noop
        },
        partiallyApplied: sinon.stub().returns(mockApplied)
      };

      const setImmediateImpl = ImmediateDefinition.prototype.createSetTimeoutSetImmediate.call(instance);

      const handle = setImmediateImpl();

      expect(handle).to.equal(123456);
      expect(instance.addFromSetImmediateArguments).have.been.called;
      expect(instance.root.setTimeout).have.been.calledWith(mockApplied, 0);
    });
  });

  describe('integration test', () => {
    it('should work', (done: MochaDone) => {
      const results = [];
      Rx.Observable.from([1, 2, 3], Rx.Scheduler.asap)
        .subscribe((x: number) => {
          results.push(x);
        }, () => {
          done(new Error('should not be called'));
        }, () => {
          expect(results).to.deep.equal([1, 2, 3]);
          done();
        });
    });
  });
});