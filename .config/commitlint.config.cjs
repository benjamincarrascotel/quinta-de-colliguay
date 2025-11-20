/* eslint-env node */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat","fix","docs","style","refactor","test","chore","perf","ci","revert"]],
    "type-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "scope-empty": [2, "never"],
    "scope-case": [2, "always", "kebab-case"],
    "subject-empty": [2, "never"],
    "subject-case": [2, "never", ["start-case","pascal-case","upper-case"]],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100]
  }
};
