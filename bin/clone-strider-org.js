#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const execa = require('execa');
const fs = Promise.promisifyAll(require('fs'));
const got = require('got');

const STRIDER_ORG_REPOS = 'https://api.github.com/orgs/strider-cd/repos?per_page=200';
const CONCURRENT_JOBS = argv.jobs || 6;

console.log('Cloning all repositories in the strider-cd organization…');
got(STRIDER_ORG_REPOS, {json: true})
  .then(response => {
    return Promise.map(response.body, cloneRepo, {
      concurrency: CONCURRENT_JOBS
    });
  })
  .then(count => console.log(`Operation completed. Cloned ${count.filter(Boolean).length} repositories. Total projects: ${count.length}`))
  .catch(error => {
    console.error(error);
  });

function cloneRepo(repo) {
  return fs.statAsync(repo.name)
    .then(() => {
      if (argv.verbose) {
        console.log(`  '${repo.full_name}' already cloned. Skipping.`);
      }
      return false;
    })
    .catch({code: 'ENOENT'}, () => {
      console.log(`  Cloning '${repo.full_name}'…`);

      const urlToUse = argv.https ? repo.clone_url : repo.ssh_url;

      return Promise.resolve(execa('git', ['clone', urlToUse]))
        .return(true);
    });
}
