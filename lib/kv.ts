// ============================================================
// lib/kv.ts — In-memory mock for Vercel KV / Redis
// ============================================================
// Fallback non-persistant pour le développement local.
// En production sur Vercel, on utiliserait le vrai client @vercel/kv.
// ============================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

const store = new Map<string, CacheEntry<any>>();

/**
 * Nettoyage régulier pour simuler le TTL
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.expiresAt && now > entry.expiresAt) {
        store.delete(key);
      }
    });
  }, 60 * 1000); // Check every minute
}

export const kv = {
  /**
   * Get a value
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  },

  /**
   * Set a value with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, opts?: { ex?: number }): Promise<void> {
    const expiresAt = opts?.ex ? Date.now() + opts.ex * 1000 : null;
    store.set(key, { value, expiresAt });
  },

  /**
   * Increment a counter
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + amount;
    // Note: in-memory incr doesn't update TTL, similar to redis incr
    const entry = store.get(key);
    store.set(key, { value: newValue, expiresAt: entry?.expiresAt || null });
    return newValue;
  },

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    store.delete(key);
  },

  /**
   * Left Push to a list (prepend)
   * Caps the list at `maxLen` if provided to avoid memory leaks
   */
  async lpush<T>(key: string, value: T, maxLen: number = 500): Promise<void> {
    let list = (await this.get<T[]>(key)) || [];
    list.unshift(value);
    if (list.length > maxLen) {
      list = list.slice(0, maxLen);
    }
    store.set(key, { value: list, expiresAt: null });
  }
};
