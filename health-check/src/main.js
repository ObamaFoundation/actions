const Assertions = require("./assertions.js")

const ARGS = {
  endpoint: process.env.HEALTH_CHECK_ENDPOINT,
  json_assertions: process.env.HEALTH_CHECK_JSON_ASSERTIONS,
}

module.exports =
  ({ core, fetch }) =>
  async () => {
    try {
      const response = await fetch(ARGS.endpoint)
      const results = []

      // Status Checks
      if (response.status !== 200) {
        results.push({
          result: "fail",
          message: `Status code ${response.status}`,
        })
      } else {
        results.push({
          result: "pass",
          message: `Status code ${response.status}`,
        })
      }

      // JSON Assertions
      const assertions = Assertions.parse(ARGS.json_assertions)

      if (assertions.length > 0) {
        const json = await response.json()

        assertions.forEach((assertion) => {
          const [key, op, value] = assertion
          results.push(Assertions.assert(json[key], op, value))
        })
      }
      if (results.some((r) => r.result == "fail")) {
        core.setFailed(`Action failed health check`)
      }
    } catch (error) {
      core.setFailed(`Action failed with error ${error}`)
    }
  }
