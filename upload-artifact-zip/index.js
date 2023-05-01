/*
 * Zip and Upload Artifact.
 */

const core = require('@actions/core');
const artifact = require('@actions/artifact');
const io = require('@actions/io');
const exec = require('@actions/exec');

async function run() {
  const tempDir = 'tmp';
  try {
    const artifactName = core.getInput("artifact_name", { required: true });
    const zipName = core.getInput("zip_name");  // Default value set in action.yml
    const zipPath = `${tempDir}/${zipName}`;
    const retentionDays = Number(core.getInput("retention_days"));
    const paths = core.getInput("paths");
    await io.mkdirP(tempDir);

    const zipResult = await exec.exec('zip', ['-rq', zipPath, paths]);
    if (zipResult) {
      throw ('Zip failed');
    }
    const artifactClient = artifact.create();
    core.info(`Starting upload for ${zipName} to ${artifactName}.`);
    const uploadOptions = { retentionDays };
    const uploadResponse = await artifactClient.uploadArtifact(
      artifactName,
      [zipPath],
      tempDir,
      uploadOptions
    );
    if (uploadResponse.failedItems.length) {
      throw `Failed to upload ${failedItems}`;
    }
    core.info(`Upload of ${uploadResponse.size} bytes successful`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
