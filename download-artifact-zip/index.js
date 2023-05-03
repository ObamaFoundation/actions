/*
 * Download and Unzip Artifact.
 *
 * This action is written in JS, because the actions/download_artifact provided
 * by GitHub fails when an artifact doesn't exist.
 *
 * Inspiration from https://github.com/xSAVIKx/artifact-exists-action
 */

const core = require('@actions/core');
const artifact = require('@actions/artifact');
const io = require('@actions/io');
const exec = require('@actions/exec');

async function run() {
  const tempDir = 'tmp';
  try {
    const artifactName = core.getInput("artifact-name", { required: true });
    const zipName = core.getInput("zip-name");  // Default value set in action.yml
    await io.mkdirP(tempDir);
    const tempArtifactPath = `${tempDir}/${artifactName}`;
    const artifactClient = artifact.create();
    core.info(`Starting download for ${artifactName} to ${tempArtifactPath}.`);
    const downloadOptions = { createArtifactFolder: false };
    try {
      const downloadResponse = await artifactClient.downloadArtifact(
        artifactName,
        tempArtifactPath,
        downloadOptions
      );
      core.info(`Artifact ${downloadResponse.artifactName} exists. Unzipping...`);
      core.setOutput("exists", true);
    } catch (err) {
      core.info(`Artifact ${artifactName} does not exist.`);
      core.setOutput("exists", false);
      return;
    }

    const zipResult = await exec.exec('unzip', ['-q', `${tempArtifactPath}/${zipName}`]);
    if (zipResult) {
      throw ('Unzip failed');
    }
    core.info('Unzip successful');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
