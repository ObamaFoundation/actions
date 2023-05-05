# Publish to Chromatic

Publishes the site to Chromatic for review.

See the [action.yml](./action.yml) file for parameter info.

## Example usage

```yaml
uses: ObamaFoundation/actions/publish-to-chromatic@v1
with:
  chromatic-project-token: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```
