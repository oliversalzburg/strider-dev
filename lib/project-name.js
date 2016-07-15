'use strict';

const attemptRequire = require('attempt-require');
const path = require('path');

function projectName(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = attemptRequire(packageJsonPath);

  if (!packageJson) {
    return null;
  }

  return packageJson.name;
}

module.exports = projectName;
