module.exports = {
  // JS/TS: use codeframe to view lines and then format
  "resources/js/**/*.{js,jsx,ts,tsx}": [
    "eslint --fix --format=codeframe",
    "prettier --write"
  ],

  // PHP: syntax check every staged file and validate formatting with Pint
  "**/*.php": (files) => [
    ...files.map((file) => `php -l "${file}"`),
    "vendor/bin/pint --dirty -v --test",
  ],
  // --- CSS/SCSS ---
  "resources/js/**/*.{css,scss}": ["prettier --write"]
};
