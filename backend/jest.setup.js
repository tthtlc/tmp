// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Learn more: https://jestjs.io/docs/configuration#setupfilesafterenv-array

// Add custom matchers or global test setup here
global.console = {
  ...console,
  // Suppress console.log during tests unless needed
  log: process.env.NODE_ENV === 'test' ? jest.fn() : console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};