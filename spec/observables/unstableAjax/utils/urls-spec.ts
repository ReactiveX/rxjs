import { expect } from 'chai';
import * as sinon from 'sinon';
import { itOnly } from '../__fixtures__/testHelper';

import 'url-search-params-polyfill';
import { buildURL, combineURLs, isAbsoluteURL, isURLSameOrigin } from 'rxjs/internal/observable/unstableAjax/utils/urls';

describe('urls', () => {
  describe('buildURL', () => {
    it('should support null params', () => {
      expect(buildURL('/foo')).to.equal('/foo');
    });

    it('should support params', () => {
      expect(
        buildURL('/foo', {
          foo: 'bar'
        })
      ).to.equal('/foo?foo=bar');
    });

    it('should support object params', () => {
      expect(
        buildURL('/foo', {
          foo: {
            bar: 'baz'
          }
        })
      ).to.equal('/foo?foo=' + encodeURI('{"bar":"baz"}'));
    });

    it('should support date params', () => {
      let date = new Date();

      expect(
        buildURL('/foo', {
          date: date
        })
      ).to.equal('/foo?date=' + date.toISOString());
    });

    it('should support array params', () => {
      expect(
        buildURL('/foo', {
          foo: ['bar', 'baz']
        })
      ).to.equal('/foo?foo[]=bar&foo[]=baz');
    });

    it('should support special char params', () => {
      expect(
        buildURL('/foo', {
          foo: '@:$, '
        })
      ).to.equal('/foo?foo=@:$,+');
    });

    it('should support existing params', () => {
      expect(
        buildURL('/foo?foo=bar', {
          bar: 'baz'
        })
      ).to.equal('/foo?foo=bar&bar=baz');
    });

    it('should support "length" parameter', () => {
      expect(
        buildURL('/foo', {
          query: 'bar',
          start: 0,
          length: 5
        })
      ).to.equal('/foo?query=bar&start=0&length=5');
    });

    it('should correct discard url hash mark', () => {
      expect(
        buildURL('/foo?foo=bar#hash', {
          query: 'baz'
        })
      ).to.equal('/foo?foo=bar&query=baz');
    });

    it('should use serializer if provided', () => {
      const serializer = sinon.stub().returns('foo=bar');

      const params = { foo: 'bar' };
      expect(buildURL('/foo', params, serializer)).to.equal('/foo?foo=bar');
      expect(serializer.calledOnceWith(params)).to.be.true;
    });

    it('should support URLSearchParams', () => {
      expect(buildURL('/foo', new URLSearchParams('bar=baz'))).to.equal('/foo?bar=baz');
    });
  });

  describe('combineURLs', () => {
    it('should combine URLs', () => {
      expect(combineURLs('https://api.github.com', '/users')).to.equal('https://api.github.com/users');
    });

    it('should remove duplicate slashes', () => {
      expect(combineURLs('https://api.github.com/', '/users')).to.equal('https://api.github.com/users');
    });

    it('should insert missing slash', () => {
      expect(combineURLs('https://api.github.com', 'users')).to.equal('https://api.github.com/users');
    });

    it('should not insert slash when relative url missing/empty', () => {
      expect(combineURLs('https://api.github.com/users', '')).to.equal('https://api.github.com/users');
    });

    it('should allow a single slash for relative url', () => {
      expect(combineURLs('https://api.github.com/users', '/')).to.equal('https://api.github.com/users/');
    });
  });

  describe('isAbsoluteURL', () => {
    it('should return true if URL begins with valid scheme name', () => {
      expect(isAbsoluteURL('https://api.github.com/users')).to.be.true;
      expect(isAbsoluteURL('custom-scheme-v1.0://example.com/')).to.be.true;
      expect(isAbsoluteURL('HTTP://example.com/')).to.be.true;
    });

    it('should return false if URL begins with invalid scheme name', () => {
      expect(isAbsoluteURL('123://example.com/')).to.be.false;
      expect(isAbsoluteURL('!valid://example.com/')).to.be.false;
    });

    it('should return true if URL is protocol-relative', () => {
      expect(isAbsoluteURL('//example.com/')).to.be.true;
    });

    it('should return false if URL is relative', () => {
      expect(isAbsoluteURL('/foo')).to.be.false;
      expect(isAbsoluteURL('foo')).to.be.false;
    });
  });

  describe('isURLSameOrigin', () => {
    itOnly.browser('should detect same origin', () => {
      expect(isURLSameOrigin(window.location.href)).to.equal(true);
    });

    itOnly.browser('should detect different origin', () => {
      expect(isURLSameOrigin('https://github.com/kwonoj/oxid')).to.equal(false);
    });

    itOnly.node('should return true always', () => {
      expect(isURLSameOrigin(null as any)).to.be.true;
    });
  });
});
