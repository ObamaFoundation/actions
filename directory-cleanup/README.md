# Clean up directory

This action will clean out old files from a directory as specified. Because it's optional
to delete css and js files for each deploy, and also optional to pull files from a previous
storage container, we can build up a large number of files.  By default this action will use 10 days
of files to keep on hand.

**Note:** You may see an error regarding "Datetime with no tzinfo will be considered UTC" when running.  This does not prevent the command from running, and a fix has been merged into the cli dev environment on the Azure side. (https://github.com/Azure/azure-cli/pull/27366)

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
uses: ObamaFoundation/actions/directory-cleanup@v2
with:
  az-storage-account: 'blueobamaorg'
```

The complete interface with defaults is as follows:

```yaml
uses: ObamaFoundation/actions/directory-cleanup@v2
with:
  az-storage-account: # No Default (Required)
  az-storage-container: # Default '$web'
  file-retention-days: #default 10
```
