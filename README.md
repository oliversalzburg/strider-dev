# Development Helpers for Strider

## `clone`
Clones all repositories in the **strider-cd** GitHub organization into the current working directory.

- `--https` Use HTTPS for the cloning process. The default is to use the SSH URL.
- `--jobs=n` Set the amount of concurrent cloning processes to run. Default is **6**.
- `--verbose` More diagnostic output.

## `link`
Links (in terms of [`npm link`](https://docs.npmjs.com/cli/link)) all projects in the current working directory with each other.
This makes sure that you're using your local working directory of each project, instead of a fixed version pulled from
the npm repository.

- `--check` Perform a dry run, without actually linking the projects.
- `--verbose` More diagnostic output.

## `license`
Checks the software licenses in all projects.  
The script looks for the `license` field in the `package.json` and for files matching the pattern `/LICENSE/`.

- `--verbose` More diagnostic output.

## `style`
Copies code style definitions from one project (by default, `strider`) to all other projects.
