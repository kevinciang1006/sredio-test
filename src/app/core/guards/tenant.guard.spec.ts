import { describe, it, expect } from 'vitest';
import { isValidTenant } from './tenant.guard';

describe('isValidTenant', () => {
  it('returns true for all 4 known tenant UUIDs', () => {
    const ids = [
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'a3bb189e-8bf9-3888-9912-ace4e6543002',
      'b9e4a3cc-1234-4c5d-8901-fde234567890',
      'c7d8e9f0-abcd-4ef0-1234-567890abcdef',
    ];
    ids.forEach(id => expect(isValidTenant(id)).toBe(true));
  });

  it('returns false for an unknown UUID', () => {
    expect(isValidTenant('00000000-0000-0000-0000-000000000000')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidTenant('')).toBe(false);
  });
});
