#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const execa = require('execa');
const fs = Promise.promisifyAll(require('fs'));
const got = require('got');

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_ACCESS_TOKEN) {
  console.error('GITHUB_ACCESS_TOKEN missing. Create one at https://github.com/settings/tokens and set the environment variable.');
  process.exit(1);
}

const STRIDER_ORG_REPOS = `https://api.github.com/orgs/strider-cd/repos?per_page=200&access_token=${GITHUB_ACCESS_TOKEN}`;


console.log('Checking for repos with commits after latest tag…');
got(STRIDER_ORG_REPOS, {json: true})
  .then(response => {
    return Promise.each(response.body, testRepo);
  })
  .then(count => console.log(`Operation completed. ${count.filter(Boolean).length} repositories need release. Total projects: ${count.length}`))
  .catch(error => {
    console.error(error);
  });

function testRepo(repo) {
  console.log(`  ${repo.name}:`);
  return Promise.resolve(got(`https://api.github.com/repos/strider-cd/${repo.name}/tags?access_token=${GITHUB_ACCESS_TOKEN}`, {json: true}))
    .then(response => {
      const tags = response.body;
      if (!tags || !tags.length) {
        console.log('    RELEASE: No tags.');
        return true;
      }

      return got(`https://api.github.com/repos/strider-cd/${repo.name}/commits`, {json: true})
        .then(response => {
          const commits = response.body;
          if (commits[0].sha !== tags[0].commit.sha) {
            console.log(`    RELEASE: SHA mismatch: ${commits[0].sha} - ${tags[0].commit.sha}`);
            return true;
          }

          console.log('    All done!');

          return false;
        });

    })
    .catch({statusCode: 403}, () => console.log(`    UNKNOWN: 403 error`))
    .return(false);
}
