'use strict';

const attemptRequire = require('attempt-require');
const path = require('path');

function projectName(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = attemptRequire(packageJsonPath);

  if (!packageJson) {
    throw new Error('Not a NodeJS project or package.json is broken.');
  }

  return packageJson.name;
}

module.exports = projectName;
