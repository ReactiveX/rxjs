import { expect } from 'chai';
import { normalizeHeaderName } from 'rxjs/internal/observable/unstableAjax/utils/normalizeHeaderName';

describe('normalizeHeaderName', () => {
  it('should normalize matching header name', () => {
    const headers = {
      'conTenT-Type': 'foo/bar'
    };
    normalizeHeaderName(headers, 'Content-Type');
    expect(headers['Content-Type']).to.equal('foo/bar');
    expect(headers['conTenT-Type']).to.be.undefined;
  });

  it('should not change non-matching header name', () => {
    const headers = {
      'content-type': 'foo/bar'
    };
    normalizeHeaderName(headers, 'Content-Length');
    expect(headers['content-type']).to.equal('foo/bar');
    expect(headers['Content-Length']).to.be.undefined;
  });
});
