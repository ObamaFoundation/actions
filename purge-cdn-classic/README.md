# Purge Classic CDN Endpoint

This action purges a single endpoint within an Azure CDN (Classic) Profile.

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
# Minimal Example
uses: ObamaFoundation/actions/purge-cdn-classic@v2.3
with:
  resource-group: of-obama-org
  profile-name: dev-obama-org-CDN
  endpoint-name: dev-obama-org
```

The complete interface with defaults is as follows:

```yaml
uses: ObamaFoundation/actions/purge-cdn-classic@v2.3
with:
  resource-group:   # Required
  profile-name:     # Required
  endpoint-name:    # Required
  content-paths:    # default '/*'
```
