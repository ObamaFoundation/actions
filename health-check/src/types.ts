export type Result = {
  result: 'pass' | 'fail';
  assertion: string;
}

export type Op = "==" | "!=" | "<" | ">" | "<=" | ">=";

export type Assertion = {
  left: string;
  op: Op;
  right: string;
}