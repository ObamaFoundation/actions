import { Result } from "./types";
import { assert, parse } from "./assertions";
import * as core from "@actions/core";

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
  core.debug(`Health Check try ${tryNum} for: ${endpoint}`);
  try {
    const response = await fetch(endpoint);
    const results: Result[] = [];

    // Status Checks
    core.debug(`-- Status Check: ${response.status}`);
    if (response.status !== 200) {
      results.push({
        result: "fail",
        assertion: `Status code == ${response.status}`,
      });
      console.log("Invalid status code:", response.status);
      return false;
    } else {
      results.push({
        result: "pass",
        assertion: `Status code == ${response.status}`,
      });
    }
    const responseText = await response.text();
    console.log(`Response: ${responseText}`);

    core.debug(`-- Assertions Count: ${jsonAssertions.length}`);
    if (jsonAssertions.length > 0) {
      const json = JSON.parse(responseText);

      jsonAssertions.forEach((assertion) => {
        const { left, op, right } = parse(assertion);
        results.push(assert({ left: json[left], op, right }));
      });
    }
    if (results.some((r) => r.result == "fail")) {
      console.log("Assertions failed. See summary for details.");
      return false;
    }
    // Output Results
    core.debug(`-- Results: ${JSON.stringify(results, null, 2)}`);
    core.summary.addHeading("Health Check Results", 2);
    core.summary.addRaw(`For ${endpoint}`, true);
    core.summary.addTable(
      results.map(({ assertion, result }) => [
        assertion,
        result == "pass" ? "✅" : "❌",
      ]),
    );
    core.summary.write();
  } catch (error) {
    const msg = `Action failed with error ${error}`;
    console.log(msg);
    core.warning(msg);
    return false;
  }
  console.log("Assertions passed. See summary for details.");
  return true;
}

export async function main() {
  const endpoint = core.getInput("endpoint", { required: true });
  const jsonAssertions = core.getMultilineInput("json_assertions");
  const retries = core.getInput("retries");
  const retriesNumber = retries ? parseInt(retries) : 0;
  for (let tryIdx = 0; tryIdx <= retriesNumber; tryIdx++) {
    console.log("Try:", tryIdx + 1);
    if (await doCheck(endpoint, jsonAssertions, tryIdx)) {
      return;
    }
    if (tryIdx !== retriesNumber) {
      await sleep();
    }
  }
  core.setFailed(`Health check action failed after ${retriesNumber} retries.`);
}
