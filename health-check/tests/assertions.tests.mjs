import A from "../src/assertions.js"
import assert from "node:assert"

[
  [true, "==", true],
  [true, "!=", false],
  [true, "===", true],
  [true, "!==", false],
  [true, "==", "true"],
].forEach((assertion) => {
  const { result } = A.assert(...assertion)
  assert(result === "pass")
})
