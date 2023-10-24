# Run Terraform Plan (& Apply)

** DEPRECATED ** You should use the discrete `terraform-plan` and `terraform-apply` actions in this repo instead. This action is no longer maintained.

This action runs Terraform Plan and (optionally) Apply against a specified subdirectory (component).

The action assumes you have a properly configured backend and runs `terraform init` before any other actions.

**Note:** Terraform providers generally handle authentication themselves, so there is no need to use specialized steps like the `azure/login` action, as we do with other actions that interact directly with third-party services. This difference, however, still requires us to pass secret values to the action. For the `azurerm` provider, we authenticate using a service principal. A such, you will need to pass along the SP's credentials in the form of environment variables to the Terraform action. See the [`azurerm`](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/service_principal_client_secret) docs for more info.

This is probably what you'll need:

```yaml

---
env:
  ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
  ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
  ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
  ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
```

See the [action.yml](./action.yml) file for parameter info.

## Example usage

The following minimal example will run this action against the `myterraformfolder` subdirectory:

```yaml
uses: ObamaFoundation/actions/terraform-plan-apply@v1
with:
  component: "myterraformfolder"
```

To run the action AND apply the changes (DANGER! Make sure you have the right branch and ref rules set!):

```yaml
uses: ObamaFoundation/actions/terraform-plan-apply@v1
with:
  component: "myterraformfolder"
  apply: true
```

If for some reason you want to skip the validation and fmt steps, you can pass the `skip_validation` and `skip_fmt` variables too. The full interface is as follows:

```yaml
uses: ObamaFoundation/actions/terraform-plan-apply@v1
with:
  component: "myterraformfolder" #(required)
  apply: false #(default)
  skip_fmt: false #(default)
  skip_validate: false #(default)
```
