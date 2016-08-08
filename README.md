# Development Helpers for Strider
[![Build Status](https://travis-ci.org/oliversalzburg/strider-dev.svg?branch=master)](https://travis-ci.org/oliversalzburg/strider-dev)

## `clone`
Clones all repositories in the **strider-cd** GitHub organization into the current working directory.

- `--https` Use HTTPS for the cloning process. The default is to use the SSH URL.
- `--jobs=n` Set the amount of concurrent cloning processes to run. Default is **6**.
- `--verbose` More diagnostic output.

## `license`
Checks the software licenses in all projects.  
The script looks for the `license` field in the `package.json` and for files matching the pattern `/LICENSE/`.

- `--verbose` More diagnostic output.

## `link`
Links (in terms of [`npm link`](https://docs.npmjs.com/cli/link)) all projects in the current working directory with each other.
This makes sure that you're using your local working directory of each project, instead of a fixed version pulled from
the npm repository.

- `--check` Perform a dry run, without actually linking the projects.
- `--verbose` More diagnostic output.

## `needs-release`
Checks for projects where the latest tag does not point to the latest commit.

This indicates that commits have been pushed to `master` after the last release, meaning that they're pending release.

## `style`
Copies code style definitions from one project (by default, `strider`) to all other projects.

- `--from=project` The name of the project to copy the style files from. Default is `strider`.
- `--check-only` Only performs checks on the state of the project.
- `--deploy-only` Only copies existing style documents without running checks.

## Instructions
For some scripts, it may be useful to properly authenticate with GitHub, to avoid running into their API limit (some 
scripts might even require this procedure).  
Go to https://github.com/settings/tokens and register a new token, then set that token under the `GITHUB_ACCESS_TOKEN`
environment variable.

![](https://i.imgur.com/Q5dIwVA.png)
