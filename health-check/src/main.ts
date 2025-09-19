import { Result } from "./types";
import { assert, parse } from "./assertions";
import * as core from "@actions/core";

let sleepTime = 50;
let timeoutLimit = 300000;
let checkInProgress = true;

// For testing, to set the sleep time lower.
export function setSleepTime(timeMs) {
  sleepTime = timeMs;
}

export function setTimeoutLimit(timeMs) {
  timeoutLimit = timeMs;
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

function logFailure(msg: string) {
  console.log(msg);
  core.warning(msg);
}

async function doCheck(endpoint: string, jsonAssertions: string[], elapsedTime: number) {

  core.debug(`Health Check try for: ${endpoint}. Waiting...`);
  let results: Result[] = [];
  try {
    const response = await fetch(endpoint, { headers: { "cache-control": "no-cache" } });

    // Status Checks
    core.debug(`-- Status Check: ${response.status}`);
    if (response.status !== 200) {
      results.push({
        result: "fail",
        assertion: `Status code == ${response.status}`,
      });
      logFailure("Invalid status code: " + response.status);
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
        logFailure("Invalid JSON from endpoint: " + error.toString());
        core.warning("Invalid JSON from endpoint");
        return false;
      }

      jsonAssertions.forEach((assertion) => {
        const { left, op, right } = parse(assertion);
        results.push(assert({ left: json[left], op, right }));
      });
    }

    if (results.some((r) => r.result == "fail")) {
      console.log("Assertions failed.");
      if (elapsedTime >= timeoutLimit) {
        outputResults(endpoint, results);
      }
      return false;
    }
  } catch (error) {
    logFailure(`Action failed with error ${error}`);
    core.setFailed(`Action failed with error ${error}`);
    return false;
  }
  checkInProgress = false;
  outputResults(endpoint, results);
  console.log("Assertions passed. See summary for details.");
  return true;
}

export async function main() {
  const endpoint = core.getInput("endpoint", { required: true });
  const jsonAssertions = core.getMultilineInput("json_assertions");
  const pollingInterval = core.getInput("pollingInterval");
  const interval = pollingInterval ? parseInt(pollingInterval) : 15000;
  setSleepTime(interval);
  let elapsedTime = 0;
  checkInProgress = true;

  console.time("Health Check");

  while (elapsedTime <= timeoutLimit && checkInProgress) {
    let completedCheck = await doCheck(endpoint, jsonAssertions, elapsedTime);
    await sleep();
    elapsedTime += interval;

    if (elapsedTime > timeoutLimit && !completedCheck) {
      // I've arbitrarily set the maximum wait to 5 minutes. 
      core.setFailed(`Health check action exceeded wait period of ${timeoutLimit} milliseconds.`);
      return;
    }
  }

  console.timeEnd("Health Check");
}