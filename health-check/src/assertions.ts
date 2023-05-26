import { Result, Assertion, Op, OpIndex } from "./types"

const OPS = ["==", "!=", "<", ">", "<=", ">="]

const op_index = (input: string) => (op: Op) => ({ op, idx: input.indexOf(op) })
const found_indexes = ({ idx }) => idx > 0

const parse_assertion = (input: string): Assertion => {  
  // We just want to get the index of the first op in the string
  // so we can split the string into left and right.
  // We need the original Op to know its length.
  const op_idxs: OpIndex[] = OPS
    .map(op_index(input))
    .filter(found_indexes)

  if (op_idxs.length == 0) {
    throw new Error(`Invalid assertion: ${input}. No valid Operator found.`)
  } else {
    const left = input.slice(0, op_idxs[0].idx).trim()
    const op = op_idxs[0].op
    const right = input.slice(op_idxs[0].idx + op.length).trim()
    
    return { left, op, right }
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
export const parse = (assertion_string: string) => parse_assertion(assertion_string)
