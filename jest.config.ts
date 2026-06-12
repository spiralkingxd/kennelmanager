import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/modules/**/*.test.ts', '<rootDir>/tests/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/modules/**/service.ts',
    'src/modules/**/repository.ts',
    'src/modules/**/controller.ts',
    'src/shared/**/*.ts',
    '!src/shared/utils/apiFetch.ts',
    '!src/config/**',
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
};

export default config;
