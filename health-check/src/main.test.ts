import { afterEach, describe, expect, it, vi } from 'vitest'
import { checks, setSleepTime } from './checks';
import * as core from "@actions/core"

const DEBUG = false;  // true will print the healthcheck output to the console

// Modify these values to change the mock's behavior.
let endpoint = "https://jsonplaceholder.typicode.com/todos/1";
let assertions = [];
let retries = "";

// This function is hoisted, so might as well just put it at the top level.
// Mock out all of the functions in the "core" library that the health check uses.
vi.mock("@actions/core", () => {
  return {
    getInput: (key) => {
      switch(key) {
        case 'endpoint':
          return endpoint;
          break;
        case 'retries':
          return retries;
          break;
      }
    },
    getMultilineInput: () => assertions,
    debug: (msg) => {
      if (DEBUG) {
        console.log(msg);
      }
    },
    setFailed: (msg) => {
      console.error(msg);
    },
    summary: {
      write: () => {},
      addHeading: () => {},
      addTable: () => {},
    },
  };
});

describe('health check', () => {
  afterEach(() => {
    assertions = [];
    retries = "";
  })

  it('with no assertions', async () => {
    assertions = [];
    const setFailed = vi.spyOn(core, 'setFailed');

    await checks();
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('with two assertions', async () => {
    assertions = [
      "userId == 1",
      "completed == false",
    ];
    const setFailed = vi.spyOn(core, 'setFailed');

    await checks();
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('correctly fails', async () => {
    assertions = [
      "userId == 2",
      "completed == false",
    ];
    const setFailed = vi.spyOn(core, 'setFailed');

    await checks();
    expect(setFailed).toHaveBeenCalledWith("Health check action failed after 0 retries.");
  });

  it('correctly fails after 2 retries', async () => {
    retries = "2";
    assertions = [
      "userId == 2",
      "completed == false",
    ];
    const setFailed = vi.spyOn(core, 'setFailed');

    // Lower the sleep time so the test doesn't timeout.
    setSleepTime(50);
    await checks();
    expect(setFailed).toHaveBeenCalledWith("Health check action failed after 2 retries.");
  });
});
