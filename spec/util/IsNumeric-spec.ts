import {expect} from 'chai';
import { isNumeric } from 'rxjs/util/isNumeric';

/** @test {isNumeric} */
describe('isNumeric', () => {
   it('should cover the following numeric scenario', () => {
     expect(isNumeric(' ')).to.be.false;
     expect(isNumeric('\n')).to.be.false;
     expect(isNumeric('\t')).to.be.false;

     expect(isNumeric('0')).to.be.true;
     expect(isNumeric(0)).to.be.true;
     expect(isNumeric(-1)).to.be.true;
     expect(isNumeric(-1.5)).to.be.true;
     expect(isNumeric(6e6)).to.be.true;
     expect(isNumeric('6e6')).to.be.true;
  });
});
