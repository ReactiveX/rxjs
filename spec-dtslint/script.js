const { execSync } = require('child_process');
const path = require('path');
const local = path.resolve('./node_modules/typescript/lib');
execSync(`dtslint --localTs ${local} --expectOnly ./spec-dtslint`);