import { Result } from "./types"
import { assert, parse } from "./assertions"
import fetch from "node-fetch"
import * as core from "@actions/core"

async function main() {
  const endpoint = core.getInput("endpoint", { required: true });
  const json_assertions = core.getMultilineInput("json_assertions")

  core.debug(`Health Check for: ${endpoint}`)
  try {
    const response = await fetch(endpoint)
    const results: Result[] = []

    // Status Checks
    core.debug(`-- Status Check: ${response.status}`)
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

    core.debug(`-- Assertsions Count: ${json_assertions.length}`)
    if (json_assertions.length > 0) {
      const json = await response.json()

      json_assertions.forEach((assertion) => {
        const { left, op, right } = parse(assertion)
        results.push(assert({ left: json[left], op, right }))
      })
    }
    if (results.some((r) => r.result == "fail")) {
      core.setFailed(`Action failed health check`)
    }
    // Output Results
    core.debug(`-- Results: ${JSON.stringify(results, null, 2)}`)
    core.summary.addHeading("Health Check Results")
    core.summary.addHeading(`For ${endpoint}`, 3)
    core.summary.addTable(
      results.map(({ assertion, result }) => [
        assertion,
        result == "pass" ? "✅" : "❌",
      ])
    )
    core.summary.write()
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`)
  }
}

main()
