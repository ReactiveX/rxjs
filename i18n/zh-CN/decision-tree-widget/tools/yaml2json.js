var yaml = require('yaml-js');
var fs = require('fs');
var inFilename = process.argv[2];
var outFilename = process.argv[3];
var yamlContent = fs.readFileSync(inFilename, 'utf8');
var jsonContent = yaml.load(yamlContent);
fs.writeFileSync(outFilename, JSON.stringify(jsonContent, null, '  '), 'utf8');
