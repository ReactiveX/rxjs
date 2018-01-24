"use strict";
var chai_1 = require('chai');
var toSubscriber_1 = require('../../dist/package/util/toSubscriber');
describe('toSubscriber', function () {
    it('should not be closed when other subscriber created with no arguments completes', function () {
        var sub1 = toSubscriber_1.toSubscriber();
        var sub2 = toSubscriber_1.toSubscriber();
        sub2.complete();
        chai_1.expect(sub1.closed).to.be.false;
        chai_1.expect(sub2.closed).to.be.true;
    });
    it('should not be closed when other subscriber created with same observer instance completes', function () {
        var observer = {
            next: function () { }
        };
        var sub1 = toSubscriber_1.toSubscriber(observer);
        var sub2 = toSubscriber_1.toSubscriber(observer);
        sub2.complete();
        chai_1.expect(sub1.closed).to.be.false;
        chai_1.expect(sub2.closed).to.be.true;
    });
});
//# sourceMappingURL=toSubscriber-spec.js.map