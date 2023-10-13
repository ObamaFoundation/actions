import { Result } from "./types"
import { assert, parse } from "./assertions"
import * as core from "@actions/core"

let sleepTime = 5000;

// For testing, to set the sleep time lower.
export function setSleepTime(timeMs) {
  sleepTime = timeMs;
}

function sleep() {
  return new Promise((resolve) => {
    setTimeout(resolve, sleepTime);
  });
}

async function doCheck(endpoint: string, jsonAssertions: string[], tryNum: number) {
  core.debug(`Health Check try ${tryNum} for: ${endpoint}`)
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
      return false;
    } else {
      results.push({
        result: "pass",
        assertion: `Status code == ${response.status}`,
      })
    }

    core.debug(`-- Assertions Count: ${jsonAssertions.length}`)
    if (jsonAssertions.length > 0) {
      const json = await response.json();

      jsonAssertions.forEach((assertion) => {
        const { left, op, right } = parse(assertion);
        results.push(assert({ left: json[left], op, right }));
      });
    }
    if (results.some((r) => r.result == "fail")) {
      return false;
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
    core.debug(`Action failed with error ${error}`);
    return false;
  }
  return true;
}

export async function main() {
  const endpoint = core.getInput("endpoint", { required: true });
  const jsonAssertions = core.getMultilineInput("json_assertions")
  const retries = core.getInput("retries");
  const retriesNumber = retries ? parseInt(retries) : 0;
  for (let tryIdx = 0; tryIdx <= retriesNumber; tryIdx++) {
    if (await doCheck(endpoint, jsonAssertions, tryIdx)) {
      return;
    }
    if (tryIdx !== retriesNumber) {
      await sleep();
    }
  }
  core.setFailed(`Health check action failed after ${retriesNumber} retries.`);
}
