import { expect } from 'chai';
import { describeOnly } from '../__fixtures__/testHelper';
import { cookies } from 'rxjs/internal/observable/unstableAjax/utils/cookies';

describe('cookies', () => {
  describeOnly.browser('on browser', () => {
    afterEach(() => {
      // Remove all the cookies
      const expires = Date.now() - 60 * 60 * 24 * 7;
      document.cookie
        .split(';')
        .map(cookie => cookie.split('=')[0])
        .forEach(name => {
          document.cookie = name + '=; expires=' + new Date(expires).toUTCString();
        });
    });

    it('should write cookies', () => {
      cookies.write('foo', 'baz');
      expect(document.cookie).to.equal('foo=baz');
    });

    it('should read cookies', () => {
      cookies.write('foo', 'abc');
      cookies.write('bar', 'def');
      expect(cookies.read('foo')).to.equal('abc');
      expect(cookies.read('bar')).to.equal('def');
    });

    it('should remove cookies', () => {
      cookies.write('foo', 'bar');
      cookies.remove('foo');
      expect(cookies.read('foo')).to.equal(null);
    });

    it('should uri encode values', () => {
      cookies.write('foo', 'bar baz%');
      expect(document.cookie).to.equal('foo=bar%20baz%25');
    });
  });

  describeOnly.node('on node', () => {
    it('should do nothing', () => {
      cookies.write('anything', 'empty');
      expect(cookies.read('anything')).to.equal('');
      expect(() => cookies.remove('others')).to.not.throw();
    });
  });
});
