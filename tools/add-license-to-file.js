var fs = require('fs');
var dist = require('minimist')(process.argv).dist;
var license = require('minimist')(process.argv).license;

module.exports = function addLicenseToFile (license, destination) {
  if (!license) {
    throw new Error('license path is required as 1st argument');
  }
  if (!destination) {
    throw new Error('destination file path is required as 2nd argument');
  }

  fs.writeFileSync(destination, `/**
  @license
  ${fs.readFileSync(license).toString()}
 **/
${fs.readFileSync(`${destination}`).toString()}
`);
}
