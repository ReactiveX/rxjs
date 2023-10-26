/* eslint jasmine/prefer-toHaveBeenCalledWith:0 */
const fs = require('fs/promises');
const { resolve } = require('canonical-path');
const { generateDocs } = require('./index.js');
const { DOCS_OUTPUT_PATH } = require('../config');

describe('authors-package (integration tests)', () => {
  let originalJasmineTimeout;
  let files;

  beforeAll(() => {
    originalJasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterAll(() => (jasmine.DEFAULT_TIMEOUT_INTERVAL = originalJasmineTimeout));

  beforeEach(() => {
    files = [];
    spyOn(fs, 'writeFile').and.callFake((file) => {
      files.push(file);
      return Promise.resolve();
    });
  });

  it('should generate marketing docs if the "fileChanged" is a marketing doc', (done) => {
    generateDocs('apps/rxjs.dev/content/marketing/team.html', { silent: true })
      .then(() => {
        expect(fs.writeFile).toHaveBeenCalled();
        expect(files).toContain(resolve(DOCS_OUTPUT_PATH, 'team.json'));
        expect(files).toContain(resolve(DOCS_OUTPUT_PATH, '../navigation.json'));
        expect(files).toContain(resolve(DOCS_OUTPUT_PATH, '../contributors.json'));
        done();
      })
      .catch(done.fail);
  });

  it('should generate guide doc if the "fileChanged" is a guide doc', (done) => {
    generateDocs('apps/rxjs.dev/content/guide/subject.md', { silent: true })
      .then(() => {
        expect(fs.writeFile).toHaveBeenCalled();
        expect(files).toContain(resolve(DOCS_OUTPUT_PATH, 'guide/subject.json'));
        done();
      })
      .catch(done.fail);
  });
});
