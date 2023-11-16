# Download Artifact Zip Action

This action downloads a Github Actions artifact and unzips it. The
action fails gracefully if the artifact doesn't exist.

See the [action.yml](./action.yml) file for parameter info.

## Example usage

```yaml
uses: ObamaFoundation/actions/download-artifact-zip@v2.3
with:
  artifact_name: 'filename'
```
