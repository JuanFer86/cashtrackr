/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  detectOpenHandles: true,
  openHandlesTimeout: 10 * 1000,
  testTimeout: 10 * 1000,
};
