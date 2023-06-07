module.exports = async ({core, exec}) => {
  const azStorageAccount = core.getInput('az-storage-account', { required: true });
  const azStorageContainer = core.getInput('az-storage-container');
  const paths = core.getInput('paths');

  const azCopyCommand = (process.platform === "win32") ? "azcopy" : "azcopy10";
  let errorCode = 0;

  // First generate a shared access signature with an expiry of one hour from now
  let expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  const expiryStr = expiry.toISOString().split('.')[0];
  let sas = '';
  const options = {
    listeners: {
      stdout: (data) => { sas += data.toString(); }
    }
  };
  errorCode = await exec.exec('az', ['storage', 'container', 'generate-sas',
    `--account-name ${azStorageAccount}`,
    `--name '${azStorageContainer}'`,
    '--permissions acdlrw',
    `--expiry ${expiryStr}`,
    '--auth-mode login',
    '--as-user',
  ], options);
  if (errorCode) {
    core.setFailed('Generating sas failed.');
    return;
  }
  // Trim leading/trailing doublequote from sas
  sas = sas.slice(1, -1);

  // Upload the html files first with cache-control set
  const destUrl = `https://${ azStorageAccount }.blob.core.windows.net/${ azStorageContainer }?` + sas;
  errorCode = await exec.exec(azCopyCommand, ['copy', `${paths}/*`, destUrl, '--recursive' , '--include-pattern', '*.html', '--cache-control', 'no-store']);
  if (errorCode)
  {
    core.setFailed('Deployment failed for html files. See log for more details.');
    return;
  }

  // Now sync everything
  errorCode = await exec.exec(azCopyCommand, ['sync', paths, destUrl, '--delete-destination=true']);
  if (errorCode)
  {
    core.setFailed('Syncing all files failed. See log for more details.');
    return;
  }

  core.info("")
  core.info("----")
  core.info("Deployment was successful!")
  core.info(`[https://${ azStorageAccount }.z19.web.core.windows.net/](https://${ azStorageAccount }.z19.web.core.windows.net/)`);
  core.info("----")
}
