import * as index from 'rxjs/ajax';
import { expect } from 'chai';

describe('index', () => {
  it('should export static ajax observable creator functions', () => {
    expect(index.ajax).to.exist;
  });

  it('should export Ajax data classes', () => {
    expect(index.AjaxError).to.exist;
    expect(index.AjaxTimeoutError).to.exist;
    // Interfaces can be checked by creating a variable of that type
    let ajaxRequest: index.AjaxRequest;
    let ajaxResponse: index.AjaxResponse<object>;
  });
});
