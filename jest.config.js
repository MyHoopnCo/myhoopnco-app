// jest.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.{ts,tsx}'],
      preset: 'jest-expo',
      setupFilesAfterFramework: ['@testing-library/jest-native/extend-expect'],
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
      globalSetup: './__tests__/integration/setup/globalSetup.ts',
      globalTeardown: './__tests__/integration/setup/globalTeardown.ts',
      setupFilesAfterFramework: [
        '@testing-library/jest-native/extend-expect',
        './__tests__/integration/setup/emulatorSetup.ts',
      ],
      testTimeout: 15000,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      coverageDirectory: 'coverage/integration',
    },
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
