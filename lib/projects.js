'use strict';

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const projectName = require('./project-name');

/**
 * Returns an array of hashes that contain the name of a project and it's path.
 * Non-NodeJS projects are ignored.
 * @param {string} root Where to look for projects.
 * @returns {Array<{name:string, path:string}>}
 */
function projects(root) {
  root = root || process.cwd();

  return fs.readdirAsync(root)
    .filter(entry => fs.statAsync(entry)
      .then(stat => stat.isDirectory())
    )
    .map(projectDirectory => path.resolve(process.cwd(), projectDirectory))
    .map(projectDirectory => ({
      name: projectName(projectDirectory),
      path: projectDirectory
    }))
    .filter(project => project.name);
}

module.exports = projects;
