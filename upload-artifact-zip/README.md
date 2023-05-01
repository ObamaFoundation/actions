# Upload Artifact Zip Action

This action zips files and uploads the result as a GitHub Actions artifact.

See the [action.yml](./action.yml) file for parameter info.

## Example usage

```yaml
uses: ObamaFoundation/actions/upload-artifact-zip@v1.0
with:
  artifact_name: 'filename'
  paths: build .svelte-kit
```
