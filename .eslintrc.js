module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".ts",
          ".tsx"
        ]
      }
    }
  },
  plugins: [
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  overrides: [
    {
      files: [
        '*.ts'
      ],
      parser: '@typescript-eslint/parser', // Typescript parser
      parserOptions: {
        ecmaVersion: 12, // use ECMAScript 12
        sourceType: 'module', // use imports
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended' // recommended rules for TypeScript
      ],
      plugins: ['@typescript-eslint'], // plugin TypeScript
      rules: {
        // Typescript specific rules
        "@typescript-eslint/no-unused-vars": "warn", // detect unused variables
        "@typescript-eslint/no-empty-function": "warn", // detect empty functions
        "@typescript-eslint/no-explicit-any": "warn", // detect any type
      }
    }
  ],
  rules: {
    // General rules
    "no-unused-vars" : "warn",
    "no-empty" : "warn",
    "no-undef" : "warn",
  }
}
