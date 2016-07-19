#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const copy = require('../lib/copy');
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

console.log(`Files to install from '${FROM}':`);
FILES_TO_DEPLOY.forEach(file => {
  console.log(`→ ${file.file}`);
});

projects(process.cwd(), true)
  .filter(project => project.name !== FROM)
  .map(project => deployCodeStyle(project.name, project.path), {concurrency: 1})
  .then(() => console.log('Done.'))
  .catch(error => {
    console.error(error);
  });

function deployCodeStyle(project, projectPath) {
  console.log(`  ${project}: Installing…`);
  return Promise.map(FILES_TO_DEPLOY, toDeploy => {
    return copy(toDeploy.path, path.join(projectPath, toDeploy.file));
  });
}
