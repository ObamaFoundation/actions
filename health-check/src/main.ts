import { Result } from "./types"
import { assert, parse } from "./assertions"
import fetch from "node-fetch"
import * as core from "@actions/core"

const ARGS = {
  endpoint: core.getInput(process.env.INPUT_ENDPOINT, { required: true }),
  json_assertions: core.getMultilineInput(process.env.INPUT_JSON_ASSERTIONS),
}

async function main() {
  try {
    const response = await fetch(ARGS.endpoint)
    const results: Result[] = []

    // Status Checks
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
    core.summary.addHeading("Health Check Results")
    core.summary.addTable(results.map(({assertion, result}) => [assertion, (result == "pass") ? "✅" : "❌"]))
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`)
  }

}

main()
