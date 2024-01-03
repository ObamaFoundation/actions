# Deploy to Azure Storage

This action uploads a directory to a specified Azure Storage account using the `az storage` command.
The typical use-case would be to upload the `build` directory for a static site. The first
step copies the *.html files with the `Cache-Control: no-store` header. Bypassing the cache in this
way helps us ensure that the session affinity cookies are set properly by Azure Front Door when
deployed to our blue/green environment(s).

The second step syncs the remaining files (non-html), deleting files if needed and requested by the caller.

An optional step copies the files from the previous storage location to the current location.  This should
be used for blue/green deployments.  To enable this, both the `copy-from-previous-location` and `last-storage-account`
must be specified.

Under the hood, the `az storage` command is using `azcopy` and creating a SAS from the login credentials.

**Note:** This action assumes you have already authenticated in your workflow with the `azure/login`
action, which should look something like this:

```yaml
- name: Azure Login
      uses: azure/login@v1
      with:
        creds: '{"clientId":"${{ inputs.AZURE_CLIENT_ID }}","clientSecret":"${{ inputs.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ inputs.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ inputs.AZURE_TENANT_ID }}"}'
```

See the [action.yml](./action.yml) file for parameter info.

## Example usage

```yaml
uses: ObamaFoundation/actions/upload-static@v2.3
with:
  az-subscription-id: '<guid-for-subscription>'
  az-storage-account: 'blueobamaorg'
```

The complete interface with defaults is as follows:

```yaml
uses: ObamaFoundation/actions/upload-static@v2.3
with:
  az-subscription-id: # No Default (Required)
  az-storage-account: # No Default (Required)
  copy-from-previous-location: # Default false
  last-storage-account: #Used for production only to copy files from the blue environment over to green and vice versa (not required)
  az-storage-container: # Default '$web'
  path: # Default 'build'
  delete-destination: #Default true
```
