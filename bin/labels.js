#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');

const argv = require('minimist')(process.argv.slice(2));
const got = require('got');

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!GITHUB_ACCESS_TOKEN) {
  console.error('GITHUB_ACCESS_TOKEN missing. Create one at https://github.com/settings/tokens (needs \'repo\' access) and set the environment variable.');
  process.exit(1);
}
if (!argv.from) {
  console.error('Missing source repository. Use --from to specify one.');
  process.exit(1);
}
if (!argv.to) {
  console.log('Missing target repository. No labels will be created anywhere.');
}

const REPO_BASE = 'https://api.github.com/repos/';
const LABEL_URL_FROM = `${REPO_BASE}${argv.from}/labels`;
const LABEL_URL_TO = argv.to ? `${REPO_BASE}${argv.to}/labels` : null;

console.log(`Reading labels from ${argv.from}…`);
Promise.resolve(got(LABEL_URL_FROM, {
  json: true,
  query: {
    per_page: 200,
    access_token: GITHUB_ACCESS_TOKEN
  }
}))
  .then(response => {
    console.log(`Found ${response.body.length} labels.`);
    return response.body;
  })
  .map(label => {
    console.log(`  ${label.name}`);
    if (!LABEL_URL_TO) return;

    return got.post(LABEL_URL_TO, {
      json: true,
      query: {
        access_token: GITHUB_ACCESS_TOKEN
      },
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        color: label.color,
        name: label.name
      })
    })
      .catch(err => {
        if (err.response.body.errors[0].code === 'already_exists') {
          // Label already exists. Good.
          return;
        }

        console.error(err.message);
        if (err.response.body.message) {
          console.error(err.response.body.message);
        }
        console.error('Failed!');
        process.exit(1);
      });
  })
  .filter(Boolean)
  .then(results => {
    console.log(`Done. ${results.length} new tags created.`);
  });
