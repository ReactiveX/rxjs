import { expect } from 'chai';

import { transformData } from 'rxjs/internal/observable/unstableAjax/core/dispatchRequest';

describe('dispatchRequest', () => {
  describe('transformData', () => {
    it('should support a single transformer', () => {
      const data = transformData({}, null as any, data => {
        data = 'foo';
        return data;
      });

      expect(data).to.equal('foo');
    });

    it('should support an array of transformers', () => {
      const transformerArray = [(data: any) => `${data}f`, (data: any) => `${data}o`, (data: any) => `${data}o`];
      const data = transformData('', null as any, transformerArray);

      expect(data).to.equal('foo');
    });

    it('should not transform if no functions provided', () => {
      const data = 'boo';
      const out = transformData(data, null as any);

      expect(data).to.equal(out);
    });

    it('should not throw if no data provided', () => {
      expect(() => transformData(null as any, null as any)).not.to.throw();
    });
  });
});
