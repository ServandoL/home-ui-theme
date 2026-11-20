import { Me, HouseholdSummary } from './models';

export const API = '/household-api/api/v1';

export function household(id: string, name = `Home ${id}`, role: HouseholdSummary['role'] = 'MEMBER'): HouseholdSummary {
  return { id, name, address: null, role, memberCount: 2 };
}

export function me(households: HouseholdSummary[], invites: Me['invites'] = []): Me {
  return { email: 'sam@example.com', households, deletedHouseholds: [], invites };
}

/** jsdom's localStorage isn't reliable here; this stands in, as in theme.service.spec.ts. */
export function createStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}
