#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const attemptRequire = require('attempt-require');
const fs = Promise.promisifyAll(require('fs'));
const identifyLicence = require('identify-licence');
const path = require('path');
const projects = require('../lib/projects');

console.log('Checking licenses…');
projects(process.cwd())
  .map(project => checkLicense(project.name, project.path), {concurrency: 1})
  .then(() => console.log('Done.'))
  .catch(error => {
    console.error(error);
  });

function checkLicense(name, projectPath) {
  console.log(`  Checking ${name}…`);

  return checkPackageJson(name, projectPath)
    .then(() => checkLicenseFile(name, projectPath));
}

function checkPackageJson(name, projectPath) {
  const packageJsonPath = path.resolve(projectPath, 'package.json');
  const packageJson = attemptRequire(packageJsonPath);

  if (!packageJson) {
    if(argv.verbose) {
      console.log('    package.json: Missing.');
    }

  } else {
    console.log(`    package.json: ${packageJson.license}`);
  }

  return Promise.resolve();
}

function checkLicenseFile(name, projectPath) {
  return fs.readdirAsync(projectPath)
    .filter(entry => entry.match(/LICENSE/))
    .then(licenseFiles => {
      if (!licenseFiles || !licenseFiles.length) {
        console.error('    LICENSE     : Missing!');
        return;
      }

      if (licenseFiles.length > 1) {
        console.error('    LICENCE     : Multiple found!');
        return;
      }

      return fs.readFileAsync(path.resolve(projectPath, licenseFiles[0]))
        .then(licenseText => {
          const license = identifyLicence(licenseText);

          console.log(`    LICENSE     : ${license[0] || 'unknown'} (${licenseFiles[0]})`);
        });
    });
}
