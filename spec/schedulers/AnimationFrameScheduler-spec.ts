import { expect } from 'chai';
import * as sinon from 'sinon';
import { animationFrameScheduler } from 'rxjs';

const _raf: Function[] = [];
const _originalRAF = requestAnimationFrame;
const _originalCAF = cancelAnimationFrame;

function stubRAF() {
  _raf.length = 0;
  _removal = {};
  try {
    (window as any).requestAnimationFrame = requestAnimationFrameStub;
  } catch (err) { /* do nothing */ }
  try {
    (global as any).requestAnimationFrame = requestAnimationFrameStub;
  } catch (err) { /* do nothing */ }
  try {
    (window as any).cancelAnimationFrame = cancelAnimationFrameStub;
  } catch (err) { /* do nothing */ }
  try {
    (global as any).cancelAnimationFrame = cancelAnimationFrameStub;
  } catch (err) { /* do nothing */ }
}

let _id = 0;
let _removal = {} as any;

function requestAnimationFrameStub(cb: Function) {
  _raf.push(cb);
  _removal[_id] = () => {
    const index = _raf.indexOf(cb);
    if (index >= 0) {
      _raf.splice(index, 1);
    }
  };
  return _id++;
}

function cancelAnimationFrameStub(id: number) {
  if (_removal[id]) {
    _removal[id]();
  }
}

function animationFrameStep() {
  if (_raf.length > 0) {
    _raf.shift()();
  }
}

function unstubRAF() {
  _raf.length = 0;
  _removal = {};
  try {
    (window as any).requestAnimationFrame = _originalRAF;
  } catch (err) { /* do nothing */ }
  try {
    (global as any).requestAnimationFrame = _originalRAF;
  } catch (err) { /* do nothing */ }
  try {
    (window as any).cancelAnimationFrame = _originalCAF;
  } catch (err) { /* do nothing */ }
  try {
    (global as any).cancelAnimationFrame = _originalCAF;
  } catch (err) { /* do nothing */ }
}

/** @test {animationFrameScheduler} */
describe('animationFrameScheduler', () => {
  let fakeTimer: sinon.SinonFakeTimers;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    fakeTimer = sandbox.useFakeTimers();
    stubRAF();
  });

  afterEach(() => {
    fakeTimer.restore();
    sandbox.restore();
    unstubRAF();
  });

  it('should wait a delay like the async scheduler, then execute the work on an animation frame if delay > 0', () => {
    let executed = false;
    animationFrameScheduler.schedule(() => executed = true, 100);

    // Even if an animation frame executes, if enough time hasn't gone by, our work shouldn't be done
    fakeTimer.tick(10);
    animationFrameStep();
    expect(executed).to.equal(false);

    // Now that we've waited the full 100ms, we *still* shouldn't be doing any work,
    // because we need to wait for an animation frame.
    fakeTimer.tick(90);
    expect(executed).to.equal(false);

    // After the animation frame fires, it should have executed.
    animationFrameStep();
    expect(executed).to.equal(true);
  });

  it('should cancel animationFrame actions when unsubscribed', () => {
    let actionHappened = false;
    animationFrameScheduler.schedule(() => {
      actionHappened = true;
    }, 50).unsubscribe();
    expect(actionHappened).to.be.false;
    fakeTimer.tick(50);
    animationFrameStep();
    expect(actionHappened).to.be.false;
  });

  it('should execute recursively scheduled actions in separate asynchronous contexts', () => {
    const expected = [0, 1, 2];
    animationFrameScheduler.schedule((state: number, reschedule: (nextState: number) => void) => {
      if (state < 3) {
        expect(state).to.equal(expected.shift());
        reschedule(state + 1);
      }
    }, 0, 0);
    animationFrameStep();
    animationFrameStep();
    animationFrameStep();
    animationFrameStep();
    expect(expected).to.deep.equal([]);
  });

  it('should cancel the animation frame if all scheduled actions unsubscribe before it executes', () => {
    let animationFrameExec1 = false;
    let animationFrameExec2 = false;
    const subs1 = animationFrameScheduler.schedule(() => { animationFrameExec1 = true; });
    const subs2 = animationFrameScheduler.schedule(() => { animationFrameExec2 = true; });
    subs1.unsubscribe();
    subs2.unsubscribe();
    animationFrameScheduler.schedule(() => {
      expect(animationFrameExec1).to.equal(false);
      expect(animationFrameExec2).to.equal(false);
    });
    animationFrameStep();
  });

  it('should execute the rest of the scheduled actions if the first action is canceled', () => {
    let results: number[] = [];

    const sub1 = animationFrameScheduler.schedule(() => results.push(1));
    animationFrameScheduler.schedule(() => results.push(2));
    animationFrameScheduler.schedule(() => results.push(3));
    animationFrameScheduler.schedule(() => results.push(4));

    sub1.unsubscribe();
    expect(results).to.deep.equal([]);
    animationFrameStep();
    expect(results).to.deep.equal([2, 3, 4]);
  });
});
