var gzipSize = require('gzip-size');
var fs = require('fs');
var path = require('path');

var files = ['../dist/global/Rx.min.js'];

files.map(getGzipSize).forEach(function (size, i) {
    console.log(path.basename(files[i]) + ': ' + formatSize(size) + ' gzipped');
});

function formatSize(size) {
    return (size / 1000).toFixed(2) + 'kB';
}

function getGzipSize(file) {
    var fileLoc = path.resolve(__dirname, file);

    if (!fs.existsSync(fileLoc)) {
        throw new Error('file not found: ' + fileLoc);
    }

    return gzipSize.sync(fs.readFileSync(fileLoc, 'utf8'));
}
