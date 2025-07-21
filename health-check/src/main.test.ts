import { beforeEach, describe, expect, it, vi } from "vitest";
import { main, setSleepTime, setTimeoutLimit } from "./main";
import * as core from "@actions/core";

// Whether to print debug info to the console while running the test.
const DEBUG = true;

const mockInitialValues = {
  endpoint: "https://jsonplaceholder.typicode.com/todos/1",
  assertions: [],
  pollingInterval: "50",
};
// Set values in this object to change the behavior of the mock. The values are reset for each test.
let mockValues = Object.assign({}, mockInitialValues);

// Mock out all of the functions in the "core" library that the health check uses.
vi.mock("@actions/core", () => {
  return {
    getInput: (key) => {
      switch (key) {
        case "endpoint":
          return mockValues.endpoint;
        case "pollingInterval":
          return mockValues.pollingInterval;
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
      addBreak: () => {},
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
    setTimeoutLimit(150);
    setSleepTime(50);
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
    expect(spySetFailed).toHaveBeenCalledWith("Health check action exceeded wait period of 150 milliseconds.");
    expect(spyAddTable).toHaveBeenCalledOnce();
  });

  it("correctly fails after 150 seconds", async () => {
    mockValues.assertions = [
      "userId == 2",
      "completed == false",
    ];

    await main();
    expect(spySetFailed).toHaveBeenCalledWith("Health check action exceeded wait period of 150 milliseconds.");
    expect(spyAddTable).toHaveBeenCalledOnce();
  });

  it("invalid assertion", async () => {
    mockValues.assertions = [
      "userId ?? 1",
      "completed == false",
    ];
    const spyWarning = vi.spyOn(core, "warning");

    await main();
    expect(spyWarning).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith("Action failed with error Error: Invalid assertion: userId ?? 1. No valid Operator found.");
    expect(spyAddTable).not.toHaveBeenCalled();
  });

  it("invalid JSON", async () => {
    mockValues.endpoint = "https://jsonplaceholder.typicode.com";
    mockValues.assertions = [
      "completed == false",
    ];

    await main();
    expect(spySetFailed).toHaveBeenCalledWith("Invalid JSON from endpoint");
    expect(spyAddTable).not.toHaveBeenCalled();
  });
});
