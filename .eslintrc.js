module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true, // Ajout de l'environnement node
  },
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".ts", // Ajout des extensions .ts
          ".tsx" // Ajout des extensions .tsx
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
        '*.ts' // Ajout des fichiers TypeScript
      ],
      parser: '@typescript-eslint/parser', // Utilisation du parser TypeScript
      parserOptions: {
        ecmaVersion: 12, // Utilisation de la dernière version ECMAScript
        sourceType: 'module', // Utilisation de modules
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended' // Utilisation des règles recommandées pour TypeScript
      ],
      plugins: ['@typescript-eslint'], // Ajout du plugin TypeScript
      rules: {
        // Vos règles spécifiques à TypeScript ici
        "@typescript-eslint/no-unused-vars": "warn", // Utilisation de la règle TypeScript pour détecter les variables non utilisées
        "@typescript-eslint/no-empty-function": "warn" // Utilisation de la règle TypeScript pour détecter les fonctions vides
      }
    }
  ],
  rules: {
    // Vos règles générales ici
    "no-unused-vars" : "warn",
    "no-empty" : "warn",
  }
}
