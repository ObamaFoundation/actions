import { Result } from "./types"
import { assert, parse } from "./assertions"
import fetch from "node-fetch"
import * as core from "@actions/core"

const ARGS = {
  endpoint: process.env.INPUT_ENDPOINT,
  json_assertions: process.env.INPUT_JSON_ASSERTIONS,
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

    // JSON Assertions
    const assertions = parse(ARGS.json_assertions)

    if (assertions.length > 0) {
      const json = await response.json()

      assertions.forEach((assertion) => {
        const { left, op, right } = assertion
        results.push(assert({ left: json[left], op, right }))
      })
    }
    if (results.some((r) => r.result == "fail")) {
      core.setFailed(`Action failed health check`)
    }
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`)
  }
}

main()
