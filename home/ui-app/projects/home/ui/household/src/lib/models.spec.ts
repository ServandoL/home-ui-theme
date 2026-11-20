import { describe, expect, it } from 'vitest';
import { formatAddress } from './models';

describe('formatAddress', () => {
  const empty = { line1: null, line2: null, city: null, region: null, postalCode: null, country: null };

  it('joins the parts that are set', () => {
    expect(
      formatAddress({ line1: '1 Main St', line2: 'Apt 2', city: 'Austin', region: 'TX', postalCode: '78701', country: 'US' }),
    ).toBe('1 Main St, Apt 2, Austin, TX 78701, US');
    expect(formatAddress({ ...empty, city: 'Austin', region: 'TX' })).toBe('Austin, TX');
    expect(formatAddress({ ...empty, postalCode: '78701' })).toBe('78701');
  });

  it('is empty without an address', () => {
    expect(formatAddress(null)).toBe('');
    expect(formatAddress(empty)).toBe('');
  });
});
