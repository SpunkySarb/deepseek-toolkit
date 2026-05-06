import { describe, it, expect } from "vitest";
import { ToolLoop } from "../src/tool-loop.js";
import {
  ToolLoopError,
} from "../src/errors.js";

describe("ToolLoop", () => {
  it("exported from module", () => {
    expect(ToolLoop).toBeDefined();
  });

  it("ToolLoopError is exported", () => {
    const err = new ToolLoopError("test", 5);
    expect(err.iterations).toBe(5);
    expect(err.name).toBe("ToolLoopError");
  });
});
