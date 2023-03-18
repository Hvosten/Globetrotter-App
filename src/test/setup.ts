import {
    beforeAll,
  } from 'vitest';
  import { fetch } from 'cross-fetch';
  
  // Add `fetch` polyfill.
  global.fetch = fetch;
  
  //beforeAll(() => console.log('RUNNING'));

