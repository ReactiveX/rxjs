import * as index from '../../src/create/index';
import { expect } from 'chai';

describe('index', () => {
  it('should export static observable creator functions', () => {
    expect(index.bindCallback).to.exist;
    expect(index.bindNodeCallback).to.exist;
    expect(index.combineLatest).to.exist;
    expect(index.concat).to.exist;
    expect(index.defer).to.exist;
    expect(index.empty).to.exist;
    expect(index.forkJoin).to.exist;
    expect(index.from).to.exist;
    expect(index.fromEvent).to.exist;
    expect(index.fromEventPattern).to.exist;
    expect(index.generate).to.exist;
    expect(index.iif).to.exist;
    expect(index.interval).to.exist;
    expect(index.merge).to.exist;
    expect(index.never).to.exist;
    expect(index.of).to.exist;
    expect(index.onErrorResumeNext).to.exist;
    expect(index.pairs).to.exist;
    expect(index.race).to.exist;
    expect(index.range).to.exist;
    expect(index.throwError).to.exist;
    expect(index.timer).to.exist;
    expect(index.using).to.exist;
    expect(index.zip).to.exist;
  });
});
