# Development Helpers for Strider

## `clone-strider-org`
Clones all repositories in the **strider-cd** GitHub organization into the current working directory.

- `--https` Use HTTPS for the cloning process. The default is to the the SSH URL.
- `--jobs=n` Set the amount of concurrent cloning processes to run. Default is **6**.

## `link`
Links (in terms of `npm link`) all projects in the current working directory with each other.
This makes sure that you're using your local working directory of each project, instead of a fixed version pulled from
the npm repository.

- `--check` Perform a dry run, without actually linking the projects.
- `--verbose` More diagnostic output.
