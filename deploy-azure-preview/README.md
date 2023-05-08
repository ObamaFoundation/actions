# Deploy preview app to Azure

Deploys preview app to Azure Webapp. Uses a Webapp slot that should match the GH branch, except for production which doesn't use a slot.

See the [action.yml](./action.yml) file for parameter info.

**Note:** This action assumes you have already authenticated in your workflow with the `azure/login` action.

## Example usage

```yaml
uses: ObamaFoundation/actions/deploy-azure-preview@v1
with:
  gh-env: 'develop'
  azure-publish-profile: ${{ secrets.PUBLISH_PROFILE }}
```
