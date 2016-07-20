#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const copy = require('../lib/copy');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const projects = require('../lib/projects');

console.log('Updating code style settings…');

const FROM = argv.from || 'strider';

const FILES_TO_DEPLOY = [
  '.idea/codeStyleSettings.xml',
  '.editorconfig',
  '.eslintrc'
].map(file => ({
  file: file,
  path: path.join(process.cwd(), FROM, file)
}));

if (!argv['check-only']) {
  console.log(`Files to install from '${FROM}':`);
  FILES_TO_DEPLOY.forEach(file => {
    console.log(`→ ${file.file}`);
  });
}

projects(process.cwd(), true)
  .filter(project => project.name !== FROM)
  .map(project => {
    console.log(`  ${project.name}:`);
    return deployCodeStyle(project.name, project.path)
      .then(() => checkProjectState(project.name, project.path));
  }, {concurrency: 1})
  .then(() => console.log('Done.'))
  .catch(error => {
    console.error(error);
  });

function deployCodeStyle(project, projectPath) {
  if (argv['check-only']) {
    return Promise.resolve();
  }

  console.log('    Deploying code style…');
  return Promise.map(FILES_TO_DEPLOY, toDeploy => {
    return copy(toDeploy.path, path.join(projectPath, toDeploy.file));
  });
}

function checkProjectState(project, projectPath) {
  if (argv['deploy-only']) {
    return Promise.resolve();
  }

  return checkBadFile('.jshintrc')
    .then(() => checkBadFile('Makefile'))
    .then(checkEngines);

  function checkBadFile(file) {
    return fs.statAsync(path.join(projectPath, file))
      .then(() => console.log(`    ${file} found!`))
      .catch(Function.prototype);
  }

  function checkEngines() {
    const packageJson = require(path.resolve(projectPath, 'package.json'));
    if (!packageJson.engines) {
      console.log('    No "engines" defined in package.json!');
      return;
    }

    if (!packageJson.engines.node) {
      console.log('    No "engines.node" defined in package.json!');
      return;
    }

    if (packageJson.engines.node === '>=4.2') return;
    console.log(`    "engines.node" is "${packageJson.engines.node}" Should be ">=4.2"!`);
  }
}

