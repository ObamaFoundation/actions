# Custom Actions

This repo contains the code for custom workflow actions. To
rebuild any of the actions follow the instructions in the
[GitHub docs](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github).

To build all JS files: `./build.sh`

Also see the documentation for [GitHub Actions Toolkit](https://github.com/actions/toolkit).

To tag a commit:

* `git tag -a -m "Explain the changes" v1.1.0`
* To move the major revision: `git tag -f v1 v1.1.0`
* `git push -f --tags`

## Testing

To test the upload and download actions, manually run the "test-upload-download" workflow in this
repo. Note that the `ACTIONS_STEP_DEBUG` repo variable can be set to `true` to enable more debug
logging.
