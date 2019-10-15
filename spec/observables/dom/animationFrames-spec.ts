import { expect } from 'chai';
import { animationFrames, Subject } from 'rxjs';
import * as sinon from 'sinon';
import { take, takeUntil } from 'rxjs/operators';
import { RAFTestTools, stubRAF } from '../../helpers/test-helper';

describe('animationFrame', () => {
  let raf: RAFTestTools;
  let DateStub: sinon.SinonStub;
  let now = 1000;

  beforeEach(() => {
    raf = stubRAF();
    DateStub = sinon.stub(Date, 'now').callsFake(() => {
      return ++now;
    });
  });

  afterEach(() => {
    raf.restore();
    DateStub.restore();
  });

  it('should animate', function () {
    const results: any[] = [];
    const source$ = animationFrames();

    const subs = source$.subscribe({
      next: ts => results.push(ts),
      error: err => results.push(err),
      complete: () => results.push('done'),
    });

    expect(DateStub).to.have.been.calledOnce;

    expect(results).to.deep.equal([]);

    raf.tick();
    expect(DateStub).to.have.been.calledTwice;
    expect(results).to.deep.equal([1]);

    raf.tick();
    expect(DateStub).to.have.been.calledThrice;
    expect(results).to.deep.equal([1, 2]);

    raf.tick();
    expect(results).to.deep.equal([1, 2, 3]);

    // Stop the animation loop
    subs.unsubscribe();
  });

  it('should use any passed timestampProvider', () => {
    const results: any[] = [];
    let i = 0;
    const timestampProvider = {
      now: sinon.stub().callsFake(() => {
        return [100, 200, 210, 300][i++];
      })
    };

    const source$ = animationFrames(timestampProvider);

    const subs = source$.subscribe({
      next: ts => results.push(ts),
      error: err => results.push(err),
      complete: () => results.push('done'),
    });

    expect(DateStub).not.to.have.been.called;
    expect(timestampProvider.now).to.have.been.calledOnce;
    expect(results).to.deep.equal([]);

    raf.tick();
    expect(DateStub).not.to.have.been.called;
    expect(timestampProvider.now).to.have.been.calledTwice;
    expect(results).to.deep.equal([100]);

    raf.tick();
    expect(DateStub).not.to.have.been.called;
    expect(timestampProvider.now).to.have.been.calledThrice;
    expect(results).to.deep.equal([100, 110]);

    raf.tick();
    expect(results).to.deep.equal([100, 110, 200]);

    // Stop the animation loop
    subs.unsubscribe();
  });

  it('should compose with take', () => {
    const results: any[] = [];
    const source$ = animationFrames();
    expect(requestAnimationFrame).not.to.have.been.called;

    source$.pipe(
      take(2),
    ).subscribe({
      next: ts => results.push(ts),
      error: err => results.push(err),
      complete: () => results.push('done'),
    });

    expect(DateStub).to.have.been.calledOnce;
    expect(requestAnimationFrame).to.have.been.calledOnce;

    expect(results).to.deep.equal([]);

    raf.tick();
    expect(DateStub).to.have.been.calledTwice;
    expect(requestAnimationFrame).to.have.been.calledTwice;
    expect(results).to.deep.equal([1]);

    raf.tick();
    expect(DateStub).to.have.been.calledThrice;
    // It shouldn't reschedule, because there are no more subscribers
    // for the animation loop.
    expect(requestAnimationFrame).to.have.been.calledTwice;
    expect(results).to.deep.equal([1, 2, 'done']);

    // Since there should be no more subscribers listening on the loop
    // the latest animation frame should be cancelled.
    expect(cancelAnimationFrame).to.have.been.calledOnce;
  });

  it('should compose with takeUntil', () => {
    const subject = new Subject();
    const results: any[] = [];
    const source$ = animationFrames();
    expect(requestAnimationFrame).not.to.have.been.called;

    source$.pipe(
      takeUntil(subject),
    ).subscribe({
      next: ts => results.push(ts),
      error: err => results.push(err),
      complete: () => results.push('done'),
    });

    expect(DateStub).to.have.been.calledOnce;
    expect(requestAnimationFrame).to.have.been.calledOnce;

    expect(results).to.deep.equal([]);

    raf.tick();
    expect(DateStub).to.have.been.calledTwice;
    expect(requestAnimationFrame).to.have.been.calledTwice;
    expect(results).to.deep.equal([1]);

    raf.tick();
    expect(DateStub).to.have.been.calledThrice;
    expect(requestAnimationFrame).to.have.been.calledThrice;
    expect(results).to.deep.equal([1, 2]);
    expect(cancelAnimationFrame).not.to.have.been.called;

    // Complete the observable via `takeUntil`.
    subject.next();
    expect(cancelAnimationFrame).to.have.been.calledOnce;
    expect(results).to.deep.equal([1, 2, 'done']);

    raf.tick();
    expect(DateStub).to.have.been.calledThrice;
    expect(requestAnimationFrame).to.have.been.calledThrice;
    expect(results).to.deep.equal([1, 2, 'done']);
  });
});
