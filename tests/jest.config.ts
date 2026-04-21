import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
  },
  setupFilesAfterEnv: [],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!backend/src/server.ts',
    '!backend/src/config/**',
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
};

export default config;
