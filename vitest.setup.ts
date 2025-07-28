import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { fetch, Request, Response } from 'cross-fetch';

// Extend vitest's expect with testing-library matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Add fetch polyfill for tests
global.fetch = fetch;
global.Request = Request;
global.Response = Response;