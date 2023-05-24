const parse_multi_line = (string) => {
  return string
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

const parse_assertion = (string) => {
  return string.split(/\s+/)
}

const evaluate_assertion = (left, op, right) => {
  const expression = `'${left}' ${op} '${right}'`
  if (eval(expression)) {
    return { assertion: expression, result: "pass" }
  } else {
    return { assertion: expression, result: "fail" }
  }
}

module.exports = {
  parse: (string) => parse_multi_line(string).map(parse_assertion),
  assert: (left, op, right) => evaluate_assertion(left, op, right),
}
