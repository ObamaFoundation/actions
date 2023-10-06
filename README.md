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

After making changes to the actions, create a new release selecting a new tag with the next higher semver as appropriate.
(Phasing out use of the tag aliases. They are too confusing to update and track.)

## Testing

The workflows in .github/workflows automatically run on every pull request and block merging on
failure.

Note that the `ACTIONS_STEP_DEBUG` repo variable can be set to `true` to enable more debug
logging.
