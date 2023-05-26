import { Result } from "./types"
import { assert, parse } from "./assertions"
import fetch from "node-fetch"
import * as core from "@actions/core"

const ARGS = {
  endpoint: core.getInput('endpoint', { required: true }),
  json_assertions: core.getMultilineInput('json_assertions'),
}

async function main() {
  core.info(`Health Check for: ${ARGS.endpoint}`)
  try {
    const response = await fetch(ARGS.endpoint)
    const results: Result[] = []

    // Status Checks
    core.info(`-- Status Check: ${response.status}`)
    if (response.status !== 200) {
      results.push({
        result: "fail",
        assertion: `Status code == ${response.status}`,
      })
    } else {
      results.push({
        result: "pass",
        assertion: `Status code == ${response.status}`,
      })
    }

    core.info(`-- Assertsions Count: ${ARGS.json_assertions.length}`)
    if (ARGS.json_assertions.length > 0) {
      const json = await response.json()

      ARGS.json_assertions.forEach((assertion) => {
        const { left, op, right } = parse(assertion)
        results.push(assert({ left: json[left], op, right }))
      })  
    }
    if (results.some((r) => r.result == "fail")) {
      core.setFailed(`Action failed health check`)
    }
    // Output Results
    core.info(`-- Results: ${JSON.stringify(results, null, 2)}`)
    core.summary.addHeading("Health Check Results")
    core.summary.addTable(results.map(({assertion, result}) => [assertion, (result == "pass") ? "✅" : "❌"]))
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`)
  }

}

main()
