import { beforeEach, describe, expect, it, vi } from "vitest";
import { main, setSleepTime } from "./main";
import * as core from "@actions/core";

// Whether to print debug info to the console while running the test.
const DEBUG = true;

const mockInitialValues = {
  endpoint: "https://jsonplaceholder.typicode.com/todos/1",
  assertions: [],
  retries: "",
};
// Set values in this object to change the behavior of the mock. The values are reset for each test.
let mockValues = Object.assign({}, mockInitialValues);

// This function is hoisted, so might as well just put it at the top level.
// Mock out all of the functions in the "core" library that the health check uses.
vi.mock("@actions/core", () => {
  return {
    getInput: (key) => {
      switch (key) {
        case "endpoint":
          return mockValues.endpoint;
          break;
        case "retries":
          return mockValues.retries;
          break;
      }
    },
    getMultilineInput: () => mockValues.assertions,
    debug: (msg) => {
      if (DEBUG) {
        console.log(msg);
      }
    },
    warning: (msg) => {
      console.log(msg);
    },
    setFailed: (msg) => {
      console.error(msg);
    },
    summary: {
      write: () => {},
      addHeading: () => {},
      addTable: () => {},
      addRaw: () => {},
    },
  };
});

let spySetFailed;
let spyAddTable;

describe("health check", () => {
  beforeEach(() => {
    mockValues = Object.assign({}, mockInitialValues);
    spySetFailed = vi.spyOn(core, "setFailed");
    spyAddTable = vi.spyOn(core.summary, "addTable");
  });

  it("with no assertions", async () => {
    await main();
    expect(spySetFailed).not.toHaveBeenCalled();
    expect(spyAddTable).toHaveBeenCalledOnce();
  });

  it("with two assertions", async () => {
    mockValues.assertions = [
      "userId == 1",
      "completed == false",
    ];

    await main();
    expect(spySetFailed).not.toHaveBeenCalled();
    expect(spyAddTable).toHaveBeenCalledOnce();
  });

  it("correctly fails", async () => {
    mockValues.assertions = [
      "userId == 2",
      "completed == false",
    ];

    await main();
    expect(spySetFailed).toHaveBeenCalledWith("Health check action failed after 0 retries.");
    expect(spyAddTable).toHaveBeenCalledOnce();
  });

  it("correctly fails after 2 retries", async () => {
    mockValues.retries = "2";
    mockValues.assertions = [
      "userId == 2",
      "completed == false",
    ];

    // Lower the sleep time so the test doesn't timeout.
    setSleepTime(50);
    await main();
    expect(spySetFailed).toHaveBeenCalledWith("Health check action failed after 2 retries.");
    expect(spyAddTable).toHaveBeenCalledOnce();
  });

  it("invalid assertion", async () => {
    mockValues.retries = "2";
    mockValues.assertions = [
      "userId ?? 1",
      "completed == false",
    ];
    const spyWarning = vi.spyOn(core, "warning");

    // Lower the sleep time so the test doesn't timeout.
    setSleepTime(50);
    await main();
    expect(spyWarning).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith("Health check action failed after 2 retries.");
    expect(spyAddTable).not.toHaveBeenCalled();
  });

  it("invalid JSON", async () => {
    mockValues.retries = "1";
    mockValues.endpoint = "https://jsonplaceholder.typicode.com"
    mockValues.assertions = [
      "completed == false",
    ];

    // Lower the sleep time so the test doesn't timeout.
    setSleepTime(50);
    await main();
    expect(spySetFailed).toHaveBeenCalledWith("Health check action failed after 1 retries.");
    expect(spyAddTable).not.toHaveBeenCalled();
  });
});
