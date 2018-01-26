/*eslint-env es6*/

var fs = require('fs');
var dist = require('minimist')(process.argv).dist;
var license = require('minimist')(process.argv).license;

// eslint-disable-next-line
function addLicenseToFile(license, destination) {
  if (!license) {
    throw new Error('license path is required as 1st argument');
  }

  // eslint-disable-next-line
  addLicenseTextToFile(fs.readFileSync(license).toString(), destination);
}

function addLicenseTextToFile(licenseText, destination) {
  if (!destination) {
    throw new Error('destination file path is required as 2nd argument');
  }

  fs.writeFileSync(destination, `/**
  @license
  ${licenseText}
 **/
${fs.readFileSync(`${destination}`).toString()}
`);
}

module.exports = {
  addLicenseToFile: addLicenseToFile,
  addLicenseTextToFile: addLicenseTextToFile
};
