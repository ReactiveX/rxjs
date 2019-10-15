import { expect } from 'chai';

import { parseHeaders } from 'rxjs/internal/observable/unstableAjax/utils/parseHeaders';

describe('parseHeaders', () => {
  it('should parse headers', () => {
    const date = new Date();

    const parsed = parseHeaders(
      'Date: ' +
        date.toISOString() +
        '\n' +
        'Content-Type: application/json\n' +
        'Connection: keep-alive\n' +
        'Transfer-Encoding: chunked'
    );

    expect(parsed['date']).to.equal(date.toISOString());
    expect(parsed['content-type']).to.equal('application/json');
    expect(parsed['connection']).to.equal('keep-alive');
    expect(parsed['transfer-encoding']).to.equal('chunked');
  });

  it('should use array for set-cookie', () => {
    const parsedZero = parseHeaders('');
    const parsedSingle = parseHeaders('Set-Cookie: key=val;');
    const parsedMulti = parseHeaders('Set-Cookie: key=val;\n' + 'Set-Cookie: key2=val2;\n');

    expect(parsedZero['set-cookie']).to.be.undefined;
    expect(parsedSingle['set-cookie']).to.deep.equal(['key=val;']);
    expect(parsedMulti['set-cookie']).to.deep.equal(['key=val;', 'key2=val2;']);
  });

  it('should handle duplicates', () => {
    const parsed = parseHeaders(
      'Age: age-a\n' + // age is in ignore duplicates blacklist
        'Age: age-b\n' +
        'Foo: foo-a\n' +
        'Foo: foo-b\n'
    );

    expect(parsed['age']).to.equal('age-a');
    expect(parsed['foo']).to.equal('foo-a, foo-b');
  });
});

