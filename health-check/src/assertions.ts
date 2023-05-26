import { Result, Assertion, Op } from "./types"

const parse_multi_line = (string: string): string[] => {
  return string
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

const parse_assertion = (input: string): Assertion => {
  const ops: Op[] = ["==", "!=", "<", ">", "<=", ">="]
  const op = ops.filter((op) => input.indexOf(op) >= 0)

  if (op.length == 0) {
    throw new Error(`Invalid assertion: ${input}`)
  } else {
    const [left, right] = input.split(op[0]).map((s) => s.trim())
    return { left, op: op[0], right }
  }
}

const evaluate_assertion = ({ left, op, right }): Result => {
  const expression = `'${left}' ${op} '${right}'`
  if (eval(expression)) {
    return { assertion: expression, result: "pass" }
  } else {
    return { assertion: expression, result: "fail" }
  }
}

export const assert = (assertion: Assertion) => evaluate_assertion(assertion)
export const parse = (multiline: string) =>
  parse_multi_line(multiline).map(parse_assertion)
