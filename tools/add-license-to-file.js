var fs = require('fs');

function addLicenseToFile (license, destination) {
  if (!license) {
    throw new Error('license path is required as 1st argument');
  }

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
