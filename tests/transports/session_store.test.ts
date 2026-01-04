/**
 * Tests for SessionStore
 *
 * @module tests/transports/session_store
 * @see {@link src/transports/session_store}
 *
 * Testing session management, TTL, capacity limits, and eviction
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  SessionStore,
  SessionEntry,
} from "../../src/transports/session_store.js";

// Helper to create mock session entries
function createMockEntry(
  sessionId: string,
  overrides: Partial<SessionEntry> = {}
): SessionEntry {
  return {
    sessionId,
    server: {} as any,
    transport: {} as any,
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    ...overrides,
  };
}

describe("SessionStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should create store with valid options", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 10000,
      });
      expect(store).toBeDefined();
      store.stop();
    });

    it("should not start sweep when ttlMs is 0", () => {
      const store = new SessionStore({
        ttlMs: 0,
        maxSessions: 100,
        sweepIntervalMs: 10000,
      });
      expect(store).toBeDefined();
      store.stop();
    });

    it("should not start sweep when sweepIntervalMs is 0", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });
      expect(store).toBeDefined();
      store.stop();
    });

    it("should accept onEvict callback", () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 10000,
        onEvict,
      });
      expect(store).toBeDefined();
      store.stop();
    });
  });

  describe("size", () => {
    it("should return 0 for empty store", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });
      expect(store.size()).toBe(0);
      store.stop();
    });

    it("should return correct count after adding sessions", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      expect(store.size()).toBe(1);

      store.set(createMockEntry("session-2"));
      expect(store.size()).toBe(2);

      store.set(createMockEntry("session-3"));
      expect(store.size()).toBe(3);

      store.stop();
    });

    it("should return correct count after removing sessions", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));
      store.delete("session-1", "test");

      expect(store.size()).toBe(1);
      store.stop();
    });
  });

  describe("hasCapacity", () => {
    it("should return true when store is empty", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 10,
        sweepIntervalMs: 0,
      });
      expect(store.hasCapacity()).toBe(true);
      store.stop();
    });

    it("should return true when below max sessions", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 10,
        sweepIntervalMs: 0,
      });

      for (let i = 0; i < 5; i++) {
        store.set(createMockEntry(`session-${i}`));
      }

      expect(store.hasCapacity()).toBe(true);
      store.stop();
    });

    it("should return false when at max sessions", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 3,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));
      store.set(createMockEntry("session-3"));

      expect(store.hasCapacity()).toBe(false);
      store.stop();
    });

    it("should return true when maxSessions is 0 (unlimited)", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 0,
        sweepIntervalMs: 0,
      });

      for (let i = 0; i < 100; i++) {
        store.set(createMockEntry(`session-${i}`));
      }

      expect(store.hasCapacity()).toBe(true);
      store.stop();
    });
  });

  describe("get", () => {
    it("should return session by id", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      const entry = createMockEntry("session-1");
      store.set(entry);

      const result = store.get("session-1");
      expect(result).toBeDefined();
      expect(result?.sessionId).toBe("session-1");
      store.stop();
    });

    it("should return undefined for unknown session", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      const result = store.get("unknown");
      expect(result).toBeUndefined();
      store.stop();
    });

    it("should update lastSeenAt on get", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      const initialTime = Date.now();
      const entry = createMockEntry("session-1", { lastSeenAt: initialTime });
      store.set(entry);

      // Advance time
      vi.advanceTimersByTime(5000);

      const result = store.get("session-1");
      expect(result?.lastSeenAt).toBeGreaterThan(initialTime);
      store.stop();
    });
  });

  describe("set", () => {
    it("should add session successfully", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      const result = store.set(createMockEntry("session-1"));
      expect(result).toBe(true);
      expect(store.size()).toBe(1);
      store.stop();
    });

    it("should return false when at capacity", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 2,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));
      const result = store.set(createMockEntry("session-3"));

      expect(result).toBe(false);
      expect(store.size()).toBe(2);
      store.stop();
    });

    it("should update existing session", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1", { createdAt: 1000 }));
      store.set(createMockEntry("session-1", { createdAt: 2000 }));

      expect(store.size()).toBe(1);
      const entry = store.get("session-1");
      expect(entry?.createdAt).toBe(2000);
      store.stop();
    });
  });

  describe("delete", () => {
    it("should remove session by id", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));

      const deleted = store.delete("session-1", "test");

      expect(deleted?.sessionId).toBe("session-1");
      expect(store.size()).toBe(1);
      expect(store.get("session-1")).toBeUndefined();
      store.stop();
    });

    it("should return undefined for unknown session", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      const result = store.delete("unknown", "test");
      expect(result).toBeUndefined();
      store.stop();
    });

    it("should call onEvict callback when deleting", () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
        onEvict,
      });

      const entry = createMockEntry("session-1");
      store.set(entry);
      store.delete("session-1", "manual-delete");

      expect(onEvict).toHaveBeenCalledWith(entry, "manual-delete");
      store.stop();
    });

    it("should not call onEvict for unknown session", () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
        onEvict,
      });

      store.delete("unknown", "test");
      expect(onEvict).not.toHaveBeenCalled();
      store.stop();
    });
  });

  describe("list", () => {
    it("should return empty array for empty store", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      expect(store.list()).toEqual([]);
      store.stop();
    });

    it("should return all sessions", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));
      store.set(createMockEntry("session-3"));

      const list = store.list();
      expect(list).toHaveLength(3);
      expect(list.map((e) => e.sessionId).sort()).toEqual([
        "session-1",
        "session-2",
        "session-3",
      ]);
      store.stop();
    });

    it("should return a copy of the sessions array", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      const list1 = store.list();
      const list2 = store.list();

      expect(list1).not.toBe(list2);
      store.stop();
    });
  });

  describe("closeAll", () => {
    it("should remove all sessions", async () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));
      store.set(createMockEntry("session-3"));

      await store.closeAll("shutdown");

      expect(store.size()).toBe(0);
      expect(store.list()).toEqual([]);
      store.stop();
    });

    it("should call onEvict for each session", async () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
        onEvict,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));
      store.set(createMockEntry("session-3"));

      await store.closeAll("shutdown");

      expect(onEvict).toHaveBeenCalledTimes(3);
      expect(onEvict).toHaveBeenCalledWith(expect.any(Object), "shutdown");
      store.stop();
    });

    it("should handle empty store", async () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
        onEvict,
      });

      await store.closeAll("shutdown");

      expect(onEvict).not.toHaveBeenCalled();
      expect(store.size()).toBe(0);
      store.stop();
    });
  });

  describe("stop", () => {
    it("should clear the sweep timer", () => {
      const store = new SessionStore({
        ttlMs: 5000,
        maxSessions: 100,
        sweepIntervalMs: 1000,
      });

      store.set(createMockEntry("session-1"));
      store.stop();

      // Advance time past TTL + multiple sweep intervals
      vi.advanceTimersByTime(20000);

      // Session should NOT be expired because sweep was stopped
      expect(store.get("session-1")).toBeDefined();
    });

    it("should be safe to call multiple times", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 10000,
      });

      expect(() => {
        store.stop();
        store.stop();
        store.stop();
      }).not.toThrow();
    });
  });

  describe("TTL expiration", () => {
    it("should expire sessions based on TTL", () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 5000,
        maxSessions: 100,
        sweepIntervalMs: 1000,
        onEvict,
      });

      store.set(createMockEntry("session-1"));

      // Advance time past TTL + sweep interval
      vi.advanceTimersByTime(7000);

      // Session should be expired
      expect(store.get("session-1")).toBeUndefined();
      expect(onEvict).toHaveBeenCalledWith(expect.any(Object), "expired");
      store.stop();
    });

    it("should not expire sessions before TTL", () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 10000,
        maxSessions: 100,
        sweepIntervalMs: 1000,
        onEvict,
      });

      store.set(createMockEntry("session-1"));

      // Advance time but not past TTL
      vi.advanceTimersByTime(5000);

      // Session should still exist
      expect(store.get("session-1")).toBeDefined();
      expect(onEvict).not.toHaveBeenCalled();
      store.stop();
    });

    it("should reset TTL on get", () => {
      const onEvict = vi.fn();
      const store = new SessionStore({
        ttlMs: 5000,
        maxSessions: 100,
        sweepIntervalMs: 1000,
        onEvict,
      });

      store.set(createMockEntry("session-1"));

      // Advance time but access session before TTL
      vi.advanceTimersByTime(4000);
      store.get("session-1"); // This updates lastSeenAt

      // Advance more time
      vi.advanceTimersByTime(4000);

      // Session should still exist because TTL was reset
      expect(store.get("session-1")).toBeDefined();
      expect(onEvict).not.toHaveBeenCalled();
      store.stop();
    });

    it("should handle async onEvict callback", async () => {
      const onEvict = vi.fn().mockResolvedValue(undefined);

      const store = new SessionStore({
        ttlMs: 5000,
        maxSessions: 100,
        sweepIntervalMs: 1000,
        onEvict,
      });

      store.set(createMockEntry("session-1"));
      store.set(createMockEntry("session-2"));

      await store.closeAll("shutdown");

      expect(onEvict).toHaveBeenCalledTimes(2);
      store.stop();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid add/remove operations", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      for (let i = 0; i < 100; i++) {
        store.set(createMockEntry(`session-${i}`));
        if (i % 2 === 0) {
          store.delete(`session-${i}`, "test");
        }
      }

      expect(store.size()).toBe(50);
      store.stop();
    });

    it("should handle session with same id replacement", () => {
      const store = new SessionStore({
        ttlMs: 60000,
        maxSessions: 100,
        sweepIntervalMs: 0,
      });

      const entry1 = createMockEntry("session-1", { createdAt: 1000 });
      const entry2 = createMockEntry("session-1", { createdAt: 2000 });

      store.set(entry1);
      store.set(entry2);

      expect(store.size()).toBe(1);
      expect(store.get("session-1")?.createdAt).toBe(2000);
      store.stop();
    });
  });
});
