# Deploy to Azure Storage

This action uploads a set of directories to a specified Azure Storage account using the `az storage blob sync` method. The typical use-case would be to upload the `build` directory of one of our static sites. The defaults assume this use case, but allow the user to override all the individual parameters, if needed. If you find this action is insuficiently customizable, you may consider using the azure/CLI action directly.

**Note:** This action assumes you have already authenticated in your workflow with the `azure/login` action, which should look something like this:

```yaml
- name: Azure Login
      uses: azure/login@v1
      with:
        creds: '{"clientId":"${{ inputs.AZURE_CLIENT_ID }}","clientSecret":"${{ inputs.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ inputs.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ inputs.AZURE_TENANT_ID }}"}'
```

See the [action.yml](./action.yml) file for parameter info.

## Example usage

```yaml
uses: ObamaFoundation/actions/upload-static@v1.0
with:
  az-storage-account: 'blueobamaorg'
```

The complete interface with defaults is as follows:

```yaml
uses: ObamaFoundation/actions/upload-static@v1.0
with:
  az-storage-account: # No Default (Required)
  az-storage-container: # Default '$web'
  paths: # Default 'build'
  delete-destination: # Default 'true'
```