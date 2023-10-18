import { Result, Assertion, Op, OpIndex } from "./types";

const OPS = ["==", "!=", "<", ">", "<=", ">="];

const opIndex = (input: string) => (op: Op) => ({ op, idx: input.indexOf(op) });
const foundIndexes = ({ idx }) => idx > 0;

const parseAssertion = (input: string): Assertion => {  
  // We just want to get the index of the first op in the string
  // so we can split the string into left and right.
  // We need the original Op to know its length.
  const opIdxs: OpIndex[] = OPS
    .map(opIndex(input))
    .filter(foundIndexes);

  if (opIdxs.length == 0) {
    throw new Error(`Invalid assertion: ${input}. No valid Operator found.`);
  } else {
    const left = input.slice(0, opIdxs[0].idx).trim();
    const op = opIdxs[0].op;
    const right = input.slice(opIdxs[0].idx + op.length).trim();

    return { left, op, right };
  }
};

const evaluateAssertion = ({ left, op, right }): Result => {
  const expression = `'${left}' ${op} '${right}'`;
  if (eval(expression)) {
    return { assertion: expression, result: "pass" };
  } else {
    return { assertion: expression, result: "fail" };
  }
};

export const assert = (assertion: Assertion) => evaluateAssertion(assertion);
export const parse = (assertion_string: string) => parseAssertion(assertion_string);
