"use strict";

let pkg = require('./compat/package.json');
let fs = require('fs-extra');
let mkdirp = require('mkdirp');
let path = require('path');
let klawSync = require('klaw-sync');
let licenseTool = require('./tools/add-license-to-file');
let makePackages = require('./.make-helpers');
let copySources = makePackages.copySources;
let createImportTargets = makePackages.createImportTargets;
let cleanSourceMapRoot = makePackages.cleanSourceMapRoot;

let addLicenseToFile = licenseTool.addLicenseToFile;
let addLicenseTextToFile = licenseTool.addLicenseTextToFile;

const ROOT = 'dist-compat/';
const CJS_ROOT = ROOT + 'cjs/compat/';
const ESM5_ROOT = ROOT + 'esm5/compat/';
const ESM2015_ROOT = ROOT + 'esm2015/compat/';
const GLOBAL_ROOT = ROOT + 'global/';
const TYPE_ROOT = ROOT + 'typings/compat/';
const PKG_ROOT = ROOT + 'package/';
const CJS_PKG = PKG_ROOT + '';
const ESM5_PKG = PKG_ROOT + '_esm5/';
const ESM2015_PKG = PKG_ROOT + '_esm2015/';
const UMD_PKG = PKG_ROOT + 'bundles/';
const SRC_ROOT_PKG = PKG_ROOT +  'src/';
const TYPE_PKG = PKG_ROOT;

// License info for minified files
let licenseUrl = 'https://github.com/ReactiveX/RxJS/blob/master/LICENSE.txt';
let license = 'Apache License 2.0 ' + licenseUrl;

// Recreate the distribution folder
fs.removeSync(PKG_ROOT);
mkdirp.sync(PKG_ROOT);

// Copy over the sources
fs.copySync(TYPE_ROOT, TYPE_PKG);
copySources(CJS_ROOT, CJS_PKG);
cleanSourceMapRoot(CJS_PKG, SRC_ROOT_PKG);
copySources(ESM5_ROOT, ESM5_PKG, true);
cleanSourceMapRoot(ESM5_PKG, SRC_ROOT_PKG);
copySources(ESM2015_ROOT, ESM2015_PKG, true);
cleanSourceMapRoot(ESM2015_PKG, SRC_ROOT_PKG);
copySources(GLOBAL_ROOT, UMD_PKG, true);
cleanSourceMapRoot(UMD_PKG, SRC_ROOT_PKG);

fs.copySync('compat/package.json', PKG_ROOT + '/package.json');
