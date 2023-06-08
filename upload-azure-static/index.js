/*
 * Upload static site to Azure storage.
 *
 * This action is written in JS.
 *
 * Inspiration from https://github.com/TravisSpomer/deploy-to-azure-storage
 */

const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  const azSubscriptionId = core.getInput('az-subscription-id', { required: true });
  const azStorageAccount = core.getInput('az-storage-account', { required: true });
  const azStorageContainer = core.getInput('az-storage-container');
  const paths = core.getInput('paths');

  let errorCode = 0;

  // Upload the html files first with cache-control set
  const destUrl = `https://${ azStorageAccount }.blob.core.windows.net/${ azStorageContainer }`;
  const copyArgs = [
    'storage',
    'copy',
    `-s=${paths}/*`,
    `-d=${destUrl}`,
    `--subscription=${azSubscriptionId}`,
    '--recursive',
    '--include-pattern=*.html',
    '--',
    '--cache-control=no-store',
  ];
  errorCode = await exec.exec('az', copyArgs);

  if (errorCode)
  {
    core.setFailed('Deployment failed for html files. See log for more details.');
    return;
  }

  // Now sync everything
  const syncArgs = [
    'storage',
    'blob',
    'sync',
    `-s=${paths}`,
    `--account-name=${azStorageAccount}`,
    `-c=${azStorageContainer}`,
    `--subscription=${azSubscriptionId}`,
  ];
  errorCode = await exec.exec('az', syncArgs);
  if (errorCode)
  {
    core.setFailed('Syncing all files failed. See log for more details.');
    return;
  }

  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  fs.appendFileSync(summaryFile, `Deployment was successful: [https://${ azStorageAccount }.z19.web.core.windows.net/](https://${ azStorageAccount }.z19.web.core.windows.net/)`)
}

run();
