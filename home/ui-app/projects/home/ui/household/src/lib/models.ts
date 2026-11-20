/** The shapes household-api returns from `GET /me`. */

export type HouseholdRole = 'ADMIN' | 'MEMBER';

export interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface HouseholdSummary {
  id: string;
  name: string;
  address: Address | null;
  /** The signed-in person's role in this household. */
  role: HouseholdRole;
  memberCount: number;
}

export interface HouseholdInvite {
  householdId: string;
  householdName: string;
  address: Address | null;
  role: HouseholdRole;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
}

export interface DeletedHousehold {
  id: string;
  name: string;
  deletedAt: string;
  deletedBy: string;
  restorableUntil: string;
}

export interface Me {
  email: string;
  households: HouseholdSummary[];
  /** Only households the signed-in person is an admin of. */
  deletedHouseholds: DeletedHousehold[];
  invites: HouseholdInvite[];
}

/** One line for pickers and badges, e.g. "1 Main St, Austin, TX 78701". Empty without an address. */
export function formatAddress(address: Address | null): string {
  if (!address) return '';
  const cityLine = [address.city, [address.region, address.postalCode].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return [address.line1, address.line2, cityLine, address.country].filter(Boolean).join(', ');
}
