# Custom Actions

This repo contains the code for custom GitHub Workflow actions. Most of the actions are
composite actions, but some are written in JS for more flexibility. The JS actions require
a build step before pushing changes.

Install all packages at the top level. To build all of the subpackages from the top level: `npm run build`.

More info on JS actions in the
[GitHub docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github).

For info on the @actions toolkit helpers see the
[GitHub Actions Toolkit documentation](https://github.com/actions/toolkit).

## Tags

The version tags follow semver.org with the expectation that workflows will specify a major version,
e.g. `@v1`. To tag a commit:

* Merge your change into `main` branch.
* `git checkout main`
* `git pull`
* Look at https://github.com/ObamaFoundation/actions/tags and use the next highest major, minor, or patch version below as X, Y, and Z (e.g. v1.0.9):
* `git tag -a -m "Explain the changes" vX.Y.Z`
* `git tag -f vX.Y`
* `git tag -f vX`
* `git push -f --tags`

## Testing

The workflows in .github/workflows automatically run on every pull request and block merging on
failure.

Note that the `ACTIONS_STEP_DEBUG` repo variable can be set to `true` to enable more debug
logging.
