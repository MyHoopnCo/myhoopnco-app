/** @type {import('jest').Config} */
module.exports = {
  testTimeout: 15000,
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.{ts,tsx}'],
      preset: 'jest-expo',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      coverageDirectory: 'coverage/unit',
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
      ],
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.test.{ts,tsx}'],
      preset: 'jest-expo',
      testEnvironment: 'node',
      globalSetup: './__tests__/integration/setup/globalSetup.ts',
      globalTeardown: './__tests__/integration/setup/globalTeardown.ts',
      setupFilesAfterEnv: [
        './__tests__/integration/setup/emulatorSetup.ts',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      coverageDirectory: 'coverage/integration',
    },
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};