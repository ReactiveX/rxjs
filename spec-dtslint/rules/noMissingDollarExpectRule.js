/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/tslint-etc
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Lint = require("tslint");
var Rule = (function (_super) {
    tslib_1.__extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
    };
    Rule.metadata = {
        description: "Disallows the $ExpectType and $ExpectError dtslint expectations that are missing a $ prefix.",
        options: null,
        optionsDescription: "Not configurable.",
        requiresTypeInfo: false,
        ruleName: "no-missing-dollar-expect",
        type: "functionality",
        typescriptOnly: false
    };
    Rule.FAILURE_STRING = "Missing $";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var Walker = (function (_super) {
    tslib_1.__extends(Walker, _super);
    function Walker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Walker.prototype.walk = function (sourceFile) {
        var text = sourceFile.getText();
        var regExp = /\/\/\s+Expect(Type|Error)/g;
        var result;
        while (result = regExp.exec(text)) {
            this.addFailureFromStartToEnd(result.index, result.index + result[0].length, Rule.FAILURE_STRING);
        }
    };
    return Walker;
}(Lint.RuleWalker));
