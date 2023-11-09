# Purge Frontdoor CDN Endpoint

This action purges a single endpoint within a frontdoor profile.

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
uses: ObamaFoundation/actions/purge-cdn-frontdoor@v2.3
with:
  resource-group: of-obama-org
  profile-name: obamaorg
  endpoint-name: blue-green-obamaorg
  domains: obama.org launchqa.obama.org
```

The complete interface with defaults is as follows:

```yaml
uses: ObamaFoundation/actions/purge-cdn-frontdoor@v2.3
with:
  resource-group:   # Required
  profile-name:     # Required
  endpoint-name:    # Required
  domains:          # Required
  content-paths:    # default '/*'
```
