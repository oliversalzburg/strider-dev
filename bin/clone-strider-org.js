#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const execa = require('execa');
const got = require('got');

const STRIDER_ORG_REPOS = 'https://api.github.com/orgs/strider-cd/repos';
const CONCURRENT_JOBS = argv.jobs || 6;

console.log('Cloning all repositories in the strider-cd organization…');
got(STRIDER_ORG_REPOS, {json: true})
  .then(response => {
    return Promise.map(response.body, cloneRepo, {
      concurrency: CONCURRENT_JOBS
    });
  })
  .then(count => console.log(`Operation completed. Cloned ${count.length} repositories.`))
  .catch(error => {
    console.error(error);
  });

function cloneRepo(repo) {
  console.log(`  Cloning '${repo.full_name}'…`);

  const urlToUse = argv.https ? repo.clone_url : repo.ssh_url;

  return execa('git', ['clone', urlToUse]);
}
