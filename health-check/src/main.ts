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

function outputResults(endpoint: string, results: Result[]) {
  // Output Results
  core.debug(`-- Results: ${JSON.stringify(results, null, 2)}`);
  core.summary.addHeading("Health Check Results", 2);
  core.summary.addRaw(`<p>For ${endpoint}</p>`, true);
  core.summary.addTable(
    results.map(({ assertion, result }) => [
      assertion,
      result == "pass" ? "✅" : "❌",
    ]),
  );
  core.summary.write();
}

function logFailure(msg: string, lastTry: boolean) {
  console.log(msg);
  if (lastTry) {
    core.warning(msg);
  }
}

async function doCheck(endpoint: string, jsonAssertions: string[], tryNum: number, lastTry: boolean) {
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
      logFailure("Invalid status code: " + response.status, lastTry);
      return false;
    } else {
      results.push({
        result: "pass",
        assertion: `Status code == ${response.status}`,
      });
    }
    const responseText = await response.text();

    core.debug(`-- Assertions Count: ${jsonAssertions.length}`);
    if (jsonAssertions.length > 0) {
      let json: Object;
      try {
        json = JSON.parse(responseText);
      } catch (error) {
        logFailure("Invalid JSON from endpoint: " + error.toString(), lastTry);
        return false;
      }

      jsonAssertions.forEach((assertion) => {
        const { left, op, right } = parse(assertion);
        results.push(assert({ left: json[left], op, right }));
      });
    }
    if (results.some((r) => r.result == "fail")) {
      if (lastTry) {
        outputResults(endpoint, results);
        logFailure("Assertions failed. See summary for details.", lastTry);
      } else {
        console.log("Assertions failed.");
      }
      return false;
    }
    outputResults(endpoint, results);
  } catch (error) {
    logFailure(`Action failed with error ${error}`, lastTry);
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
    if (await doCheck(endpoint, jsonAssertions, tryIdx, tryIdx === retriesNumber)) {
      return;
    }
    if (tryIdx !== retriesNumber) {
      await sleep();
    }
  }
  core.setFailed(`Health check action failed after ${retriesNumber} retries.`);
}
