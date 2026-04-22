# MyHoop CI/CD — file drop guide

Copy every file in this folder into the root of your `myhoopnco-app-expo` project,
preserving the folder structure exactly as shown below.

## Folder structure

```
myhoopnco-app-expo/
├── .github/
│   └── workflows/
│       └── ci.yml                          ← GitHub Actions pipeline
├── __tests__/
│   ├── unit/
│   │   └── checkin/
│   │       └── checkIn.test.ts             ← Example unit test (CHECKIN-U-*)
│   └── integration/
│       ├── setup/
│       │   ├── globalSetup.ts              ← Starts Firebase emulators
│       │   ├── globalTeardown.ts           ← Stops Firebase emulators
│       │   └── emulatorSetup.ts            ← Connects SDKs to emulator hosts
│       ├── checkin/
│       │   └── checkIn.test.ts             ← Integration tests (CHECKIN-I-*)
│       └── security/
│           └── securityRules.test.ts       ← Security rule tests (SEC-I-*)
├── database.rules.json                     ← Realtime Database security rules
├── firebase.json                           ← Emulator configuration
├── firestore.rules                         ← Firestore security rules
├── jest.config.js                          ← Jest project config (unit + integration)
├── MILESTONE.md                            ← Sprint gates tied to test IDs
├── storage.rules                           ← Firebase Storage security rules
└── TEST_SPEC.md                            ← Full test specification
```

## After copying the files

Run these commands from the project root:

```bash
# Install test dependencies
npm install --save-dev jest-expo @firebase/rules-unit-testing jest-junit @testing-library/jest-native @testing-library/react-hooks

# Add scripts to package.json manually (see below)

# Confirm emulators are configured
firebase init emulators

# Create EAS update channels (if not done already)
eas channel:create preview
eas channel:create production

# Push to GitHub to trigger the first CI run
git add .
git commit -m "ci: add pipeline, test spec, and milestone gates"
git push origin master
```

## Scripts to add to package.json

Add these inside the `"scripts"` block of your existing `package.json`:

```json
"lint": "eslint src --ext .ts,.tsx",
"type-check": "tsc --noEmit",
"test:unit": "jest --selectProjects unit",
"test:integration": "jest --selectProjects integration"
```

## Notes

- `firebase.json` will be overwritten if you already ran `firebase init emulators`.
  If that's the case, just make sure the ports in your existing file match:
  auth=9099, firestore=8080, database=9000, storage=9199, ui=4000.

- `firestore.rules` and `database.rules.json` are ready to use as-is.
  Deploy them to Firebase before the beta launch with:
  `firebase deploy --only firestore:rules,database,storage`

- Add new test files following the naming convention in TEST_SPEC.md.
  Each `it()` description must start with its test ID, e.g. `AUTH-U-01`.
