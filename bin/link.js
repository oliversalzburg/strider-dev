#!/usr/bin/env node

"use strict";

const Promise = require("bluebird");

const argv = require("minimist")(process.argv.slice(2));
const attemptRequire = require("attempt-require");
const execa = require("execa");
const fs = Promise.promisifyAll(require("fs"));
const path = require("path");

console.log("Linking…");
fs.readdirAsync(process.cwd())
  .filter(entry => fs.statAsync(entry)
    .then(stat => stat.isDirectory())
  )
  .map(projectDirectory => ({
    name: projectDirectory,
    path: path.resolve(process.cwd(), projectDirectory)
  }))
  .map(project => linkProject(project.name, project.path), {concurrency: 1})
  .then(() => console.log("Done."))
  .catch(error => {
    console.error(error);
  });

function linkProject(name, projectPath) {
  console.log(`  ${name} → ${projectPath}'…`);

  // We assume that we are in a FairManager project directory.
  const packageJsonPath = path.resolve(projectPath, "package.json");
  const packageJson = attemptRequire(packageJsonPath);

  if (!packageJson) {
    console.error(`    Unable to find 'package.json' at '${packageJsonPath}'. Skipping project.`);
    return Promise.resolve();
  }

  const projectsRoot = process.cwd();
  const linkPromise = argv.check ? Promise.resolve() : Promise.resolve(execa("npm", ["link"], {
    cwd: projectPath
  }));

  return linkPromise
    .then(() => fs.readdirAsync(projectsRoot))
    // Remove projects where the name starts with a dot.
    .filter(projectDirectory => !/^\./.test(projectDirectory))
    // Remove projects that don't have a package.json.
    .filter(projectDirectory => fs.existsSync(path.resolve(process.cwd(), projectDirectory, "package.json")))
    // Process project.
    .map(projectDirectory => {
      const projectWorkingDirectory = path.resolve(process.cwd(), projectDirectory);
      const projectPackageJsonPath = path.resolve(projectWorkingDirectory, "package.json");
      const projectPackageJson = attemptRequire(projectPackageJsonPath);
      if (!projectPackageJson) {
        console.error(`    Unable to read '${projectPackageJsonPath}'. Project '${projectDirectory}' is skipped.`);
        return;
      }

      const currentDependencyVersion = projectPackageJson.dependencies && projectPackageJson.dependencies[packageJson.name];
      const currentDevDependencyVersion = projectPackageJson.devDependencies && projectPackageJson.devDependencies[packageJson.name];

      if (!currentDependencyVersion && !currentDevDependencyVersion) {
        if (argv.verbose) {
          console.log(`    '${projectDirectory}': skipped (does not depend).`);
        }
        return;
      }

      // Allow --check to skip actually linking.
      if (argv.check) {
        console.log(`    '${projectDirectory}': Would be linked.`);
        return;
      }

      console.log(`    '${projectDirectory}': Linking…`);

      return execa("npm", ["link", packageJson.name], {
        cwd: projectWorkingDirectory
      });
    })
    .catch(error => {
      console.error(`    ERROR: ${error.stderr.substr(0, 74)}`)
    });
}
