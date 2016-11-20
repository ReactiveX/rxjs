import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import { VirtualAction } from '../../dist/cjs/scheduler/VirtualTimeScheduler';

const VirtualTimeScheduler = Rx.VirtualTimeScheduler;

/** @test {VirtualTimeScheduler} */
describe('VirtualTimeScheduler', () => {
  it('should exist', () => {
    expect(VirtualTimeScheduler).exist;
    expect(VirtualTimeScheduler).to.be.a('function');
  });

  it('should schedule things in order when flushed if each this is scheduled synchrously', () => {
    const v = new VirtualTimeScheduler();
    const invoked = [];
    const invoke = (state: number) => {
      invoked.push(state);
    };
    v.schedule(invoke, 0, 1);
    v.schedule(invoke, 0, 2);
    v.schedule(invoke, 0, 3);
    v.schedule(invoke, 0, 4);
    v.schedule(invoke, 0, 5);

    v.flush();

    expect(invoked).to.deep.equal([1, 2, 3, 4, 5]);
  });

  it('should schedule things in order when flushed if each this is scheduled at random', () => {
    const v = new VirtualTimeScheduler();
    const invoked = [];
    const invoke = (state: number) => {
      invoked.push(state);
    };
    v.schedule(invoke, 0, 1);
    v.schedule(invoke, 100, 2);
    v.schedule(invoke, 0, 3);
    v.schedule(invoke, 500, 4);
    v.schedule(invoke, 0, 5);
    v.schedule(invoke, 100, 6);

    v.flush();

    expect(invoked).to.deep.equal([1, 3, 5, 2, 6, 4]);
  });

  it('should schedule things in order when there are negative delays', () => {
    const v = new VirtualTimeScheduler();
    const invoked = [];
    const invoke = (state: number) => {
      invoked.push(state);
    };
    v.schedule(invoke, 0, 1);
    v.schedule(invoke, 100, 2);
    v.schedule(invoke, 0, 3);
    v.schedule(invoke, -2, 4);
    v.schedule(invoke, 0, 5);
    v.schedule(invoke, -10, 6);

    v.flush();

    expect(invoked).to.deep.equal([6, 4, 1, 3, 5, 2]);
  });

  it('should support recursive scheduling', () => {
    const v = new VirtualTimeScheduler();
    let count = 0;
    const expected = [100, 200, 300];

    v.schedule<string>(function(this: VirtualAction<string>, state: string) {
      if (++count === 3) {
        return;
      }
      expect(this.delay).to.equal(expected.shift());
      this.schedule(state, this.delay);
    }, 100, 'test');

    v.flush();
    expect(count).to.equal(3);
  });

  it('should not execute virtual actions that have been rescheduled before flush', () => {
    const v = new VirtualTimeScheduler();
    let messages = [];
    let action: VirtualAction<string> = <VirtualAction<string>> v.schedule(function(state: string) {
      messages.push(state);
    }, 10, 'first message');
    action = <VirtualAction<string>> action.schedule('second message' , 10);
    v.flush();
    expect(messages).to.deep.equal(['second message']);
  });
});
