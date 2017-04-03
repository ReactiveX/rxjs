import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../dist/cjs/Rx';

const Observable = Rx.Observable;

/** @test {debug} */
describe('Observable.prototype.debug', () => {

  let logNext, logError, logComplete

  beforeEach(() => {
    logNext = sinon.stub(console, 'log')
    logError = sinon.stub(console, 'error')
    logComplete = sinon.stub(console, 'info')
  })

  afterEach(() => {
    logNext.restore()
    logError.restore()
    logComplete.restore()
  })

  it('should log next value', () => {
    Observable.of(42).debug('debug').subscribe()
    expect(logNext).to.be.calledWith('debug', 42)
    expect(logComplete).to.be.calledWith('debug')
  })

  it('should log error value', () => {
    Observable.throw(42).debug('error').subscribe(null, () => {})
    expect(logError).to.be.calledWith('error', 42)
  })

  it('should log next and complete separately', () => {
    Observable.of(42).debug('next', 'error', 'complete').subscribe()
    expect(logNext).to.be.calledWith('next', 42)
    expect(logComplete).to.be.calledWith('complete')
  })

  it('should log error message from the second argument', () => {
    Observable.throw(42).debug('next', 'error').subscribe(null, () => {})
    expect(logError).to.be.calledWith('error', 42)
  })

})
