# Notify Slack channel

Sends a success or failure message to Slack.

See the [action.yml](./action.yml) file for parameter info.

## Example usage

```yaml
notify-success:
    needs: [id-of-previous-job]
    if: success()
    uses: ObamaFoundation/actions/notify-slack@v2.3
    env:
      SLACK_WEBHOOK_URL: ${{ secrets.SLACK_ERRORS_WEBHOOK_URL }}
    with:
      workflow-name: "Deployment Workflow for ${{ github.ref }}"
      success: true
```
