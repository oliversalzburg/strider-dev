#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const got = require('got');

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_ACCESS_TOKEN) {
  console.error('GITHUB_ACCESS_TOKEN missing. Create one at https://github.com/settings/tokens and set the environment variable.');
  process.exit(1);
}

const STRIDER_ORG_REPOS = 'https://api.github.com/orgs/strider-cd/repos';

console.log('Checking for repos with commits after latest tag…');
got(STRIDER_ORG_REPOS, {
  json: true,
  query: {
    per_page: 200,
    access_token: GITHUB_ACCESS_TOKEN
  }
})
  .then(response => {
    return Promise.map(response.body, testRepo, {concurrency: 1});
  })
  .then(count => console.log(`Operation completed. ${count.filter(Boolean).length} repositories need release. Total projects: ${count.length}`))
  .catch(error => {
    console.error(error);
  });

function testRepo(repo) {
  console.log(`  ${repo.name}:`);
  return Promise.resolve(got(`https://api.github.com/repos/strider-cd/${repo.name}/tags`, {
    json: true,
    query: {
      access_token: GITHUB_ACCESS_TOKEN
    }
  }))
    .then(response => {
      const tags = response.body;
      if (!tags || !tags.length) {
        console.log('    RELEASE: No tags.');
        return true;
      }

      return got(`https://api.github.com/repos/strider-cd/${repo.name}/commits`, {
        json: true,
        query: {
          access_token: GITHUB_ACCESS_TOKEN
        }
      })
        .then(response => {
          const commits = response.body;
          if (commits[0].sha !== tags[0].commit.sha) {
            console.log(`    RELEASE: SHA mismatch:  tag:${tags[0].commit.sha} → latest:${commits[0].sha}`);
            return true;
          }

          console.log('    All done!');

          return false;
        });

    })
    .catch({statusCode: 403}, () => console.log('    UNKNOWN: 403 error'));
}
