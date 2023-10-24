# Run Terraform Plan

This action runs Terraform Plan and outputs the plan to a file, which is optionally uploaded as a Github Artifact.

The action assumes you have a properly configured backend and runs `terraform init` before any other actions.
The action will validate your `.tf` files prior to running `terraform plan`.

The output of the plan is optionally uploaded as an artifact, whose name is deterministically generated from the `environment` input and workflow `run_id.` This means that subsequent steps in the workflow can look for specific plan artifacts for use in the `terraform-apply` action.

The Plan Result is also presented in a human-readable for in the action's Summary Output.

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

The following minimal example will run this action against the `./environments/terraformenvironment` subdirectory:

```yaml
uses: ObamaFoundation/actions/terraform-plan@X.Y.Z
with:
  environment: "terraformenvironment"
```

With the defaults:

```yaml
uses: ObamaFoundation/actions/terraform-plan@X.Y.Z
with:
  environment: "myterraformfolder" #(required)
  environments_dir: 'environments' #(default)
  upload_plan: false #(default)
```

### Note on Exitcodes and the PLAN Step

The `plan` step, as implemented, deserves comment. Because we 1) want the Job to succeed in the event that there are no changes, and 2) terraform outputs a plan file, even if it's a noop, we've decided to use the `-detailed-exitcode` flag, which returns a zero exit code if there are no changes and a `2` exit code when there *are* changes (exit code `1` remains the error output). This means that we can't use the `if: ${{ success() }}` conditional on the `plan` step, because it will only succeed if there are no changes. Instead, we have to set a flag by capturing the exit code and using that for our control flow. As an added complication, the terraform github action implements a wrapper around the terraform binary which does NOT respect this flag. So, we have to use the `with_wrappper: false` option on the step in order to capture the correct exit code. This is all to say that the `plan` step is a bit more complicated than it might otherwise be. The result, however, means that when we upload the plan output, we are able to simply not upload the plan file if there are no changes, which is what we want. That way, the apply step can be much simpler by always applying all the extant plan files for the workflow run.