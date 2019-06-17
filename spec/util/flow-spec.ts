import { map, toArray} from 'rxjs/operators';
import { flow, of } from 'rxjs';
import { expect } from 'chai';

declare const asDiagram: any;

/** @test {flow */
describe('flow', () => {
  it('should be equal obs.pipe(...observable)', (done) => {
    const e1 = of(1);
    const obs_pipe = e1.pipe(
      map(v => v + 1),
      map(v => v.toString())
    ).pipe(
      toArray()
    );

    const obs_flow = flow(
      e1,
      map(v => v + 1),
      map(v => v.toString())
    ).pipe(
      toArray(),
    );

    Promise.all([obs_pipe.toPromise(), obs_flow.toPromise()]).then(([v_pipe, v_flow]) => {
      expect(v_pipe).deep.eq(v_flow);
      done();
    });
  });
});
