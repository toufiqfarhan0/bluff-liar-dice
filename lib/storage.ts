/**
 * Persistent storage for the browser (replacing Expo SecureStore).
 *
 * Saves wallet session keys, active bot keys, and recent room metadata.
 */

const mem = new Map<string, string>();

export const secureStore = {
  async get(key: string): Promise<string | null> {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return mem.get(key) ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Storage access blocked
    }
    mem.set(key, value);
  },

  async del(key: string): Promise<void> {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Storage access blocked
    }
    mem.delete(key);
  },
};
