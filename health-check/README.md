# Health Check

A simple health check to assert health-check json object returns correct values for the build.

In its most basic form, the health check simply checks that the supplied endpoint returns a `200` status.

The action can also accept a newline-delimited set of assertions that are evaluated by Node. Yes, in an `eval()`. Don\'t @ me. These are VERY simple assertions, so don't expect too much. Assertions have precisely three parts:

  1. a `key` representing the `key` name of the healthcheck JSON blob that you wish to evaluate.
  2. an `operator` which is any (single) valid JS boolean operator (excluding triple-equals and variants)
  3. a comparison `value`.
  
Combining operators and expressions will result in undefined behavior. This isn't a fully fleshed-our DSL.

Because GH actions is stringly-typed, you do not (and should not) add extra quotes to string values. Thus, `version === kjhaskasdfsdfad` is evaluated by the JS interpreter as `'value-from-key-version' === 'kjhaskasdfsdfad'`. Booleans, too, are converted to strings: `boolean === true` evaluates as `'value-from-key-boolean' === 'true'`

See the [action.yml](./action.yml) file for parameter info.

## Example usage

A minimal example that only checks for a `200` response from the given endpoint:

```yaml
- uses: ObamaFoundation/actions/health-check@v1
    with:
      endpoint: "https://www.example.com/health-check"
```

A more complete example that also asserts the response JSON object contains:

```javascript
  {
    // ...
    version: 'v1.0.2',
    status: 'ok'
  }
```

```yaml
- uses: ObamaFoundation/actions/health-check@v1
    with:
      endpoint: "https://www.example.com/health-check"
      json_assertions: |
        version === v1.0.2
        status === ok
```
