/**
 * Tests for InMemoryEventStore
 *
 * @module tests/transports/event_store
 * @see {@link src/transports/event_store}
 *
 * Testing event storage, retrieval, replay, TTL, and pruning
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InMemoryEventStore } from "../../src/transports/event_store.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

// Helper to create mock JSONRPC messages
function createMessage(id: number, method: string = "test"): JSONRPCMessage {
  return {
    jsonrpc: "2.0",
    method,
    id,
  } as JSONRPCMessage;
}

describe("InMemoryEventStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should create store with valid options", () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 10000,
      });
      expect(store).toBeDefined();
      store.stop();
    });

    it("should not start sweep timer when ttlMs is 0", () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 0,
        sweepIntervalMs: 10000,
      });
      expect(store).toBeDefined();
      store.stop();
    });

    it("should not start sweep timer when sweepIntervalMs is 0", () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });
      expect(store).toBeDefined();
      store.stop();
    });
  });

  describe("storeEvent", () => {
    it("should store an event and return eventId", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const streamId = "stream-1";
      const message = createMessage(1);
      const eventId = await store.storeEvent(streamId, message);

      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe("string");
      expect(eventId).toContain(streamId);
      store.stop();
    });

    it("should generate unique eventIds for each event", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const eventId1 = await store.storeEvent("stream-1", createMessage(1));
      const eventId2 = await store.storeEvent("stream-1", createMessage(2));
      const eventId3 = await store.storeEvent("stream-2", createMessage(3));

      expect(eventId1).not.toBe(eventId2);
      expect(eventId2).not.toBe(eventId3);
      expect(eventId1).not.toBe(eventId3);
      store.stop();
    });

    it("should return eventId without storing when maxEvents is 0", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 0,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const eventId = await store.storeEvent("stream-1", createMessage(1));
      expect(eventId).toBeDefined();

      // Event should not be retrievable
      const streamId = await store.getStreamIdForEventId(eventId);
      expect(streamId).toBeUndefined();
      store.stop();
    });

    it("should store multiple events for the same stream", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const streamId = "stream-1";
      const eventId1 = await store.storeEvent(streamId, createMessage(1));
      const eventId2 = await store.storeEvent(streamId, createMessage(2));

      const retrievedStreamId1 = await store.getStreamIdForEventId(eventId1);
      const retrievedStreamId2 = await store.getStreamIdForEventId(eventId2);

      expect(retrievedStreamId1).toBe(streamId);
      expect(retrievedStreamId2).toBe(streamId);
      store.stop();
    });
  });

  describe("getStreamIdForEventId", () => {
    it("should return streamId for valid eventId", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const streamId = "test-stream";
      const eventId = await store.storeEvent(streamId, createMessage(1));
      const result = await store.getStreamIdForEventId(eventId);

      expect(result).toBe(streamId);
      store.stop();
    });

    it("should return undefined for unknown eventId", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const result = await store.getStreamIdForEventId("unknown-event-id");
      expect(result).toBeUndefined();
      store.stop();
    });
  });

  describe("replayEventsAfter", () => {
    it("should replay events after a given eventId", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const streamId = "stream-1";
      const eventId1 = await store.storeEvent(
        streamId,
        createMessage(1, "method1")
      );
      const eventId2 = await store.storeEvent(
        streamId,
        createMessage(2, "method2")
      );
      const eventId3 = await store.storeEvent(
        streamId,
        createMessage(3, "method3")
      );

      const replayedEvents: Array<{
        eventId: string;
        message: JSONRPCMessage;
      }> = [];
      const send = vi.fn(async (eventId: string, message: JSONRPCMessage) => {
        replayedEvents.push({ eventId, message });
      });

      const returnedStreamId = await store.replayEventsAfter(eventId1, {
        send,
      });

      expect(returnedStreamId).toBe(streamId);
      expect(send).toHaveBeenCalledTimes(2);
      expect(replayedEvents[0].eventId).toBe(eventId2);
      expect(replayedEvents[1].eventId).toBe(eventId3);
      store.stop();
    });

    it("should return empty string for unknown eventId", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const send = vi.fn();
      const result = await store.replayEventsAfter("unknown-id", { send });

      expect(result).toBe("");
      expect(send).not.toHaveBeenCalled();
      store.stop();
    });

    it("should replay no events if given eventId is the last one", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const streamId = "stream-1";
      await store.storeEvent(streamId, createMessage(1));
      const lastEventId = await store.storeEvent(streamId, createMessage(2));

      const send = vi.fn();
      const returnedStreamId = await store.replayEventsAfter(lastEventId, {
        send,
      });

      expect(returnedStreamId).toBe(streamId);
      expect(send).not.toHaveBeenCalled();
      store.stop();
    });

    it("should only replay events from the same stream", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const eventId1 = await store.storeEvent("stream-1", createMessage(1));
      await store.storeEvent("stream-2", createMessage(2));
      const eventId3 = await store.storeEvent("stream-1", createMessage(3));

      const replayedEvents: string[] = [];
      const send = vi.fn(async (eventId: string) => {
        replayedEvents.push(eventId);
      });

      await store.replayEventsAfter(eventId1, { send });

      expect(send).toHaveBeenCalledTimes(1);
      expect(replayedEvents[0]).toBe(eventId3);
      store.stop();
    });
  });

  describe("TTL pruning", () => {
    it("should prune expired events based on TTL", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 5000,
        sweepIntervalMs: 0,
      });

      const eventId1 = await store.storeEvent("stream-1", createMessage(1));

      // Advance time past TTL
      vi.advanceTimersByTime(6000);

      // Store another event to trigger pruning
      await store.storeEvent("stream-1", createMessage(2));

      // First event should be pruned
      const result = await store.getStreamIdForEventId(eventId1);
      expect(result).toBeUndefined();
      store.stop();
    });

    it("should not prune events before TTL expires", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 10000,
        sweepIntervalMs: 0,
      });

      const eventId = await store.storeEvent("stream-1", createMessage(1));

      // Advance time but not past TTL
      vi.advanceTimersByTime(5000);

      // Store another event
      await store.storeEvent("stream-1", createMessage(2));

      // First event should still exist
      const result = await store.getStreamIdForEventId(eventId);
      expect(result).toBe("stream-1");
      store.stop();
    });

    it("should run automatic sweep at configured interval", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 5000,
        sweepIntervalMs: 1000,
      });

      const eventId = await store.storeEvent("stream-1", createMessage(1));

      // Advance time past TTL + sweep interval
      vi.advanceTimersByTime(7000);

      // Event should be pruned by sweep
      const result = await store.getStreamIdForEventId(eventId);
      expect(result).toBeUndefined();
      store.stop();
    });
  });

  describe("maxEvents pruning", () => {
    it("should prune oldest events when maxEvents is exceeded", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 3,
        ttlMs: 0,
        sweepIntervalMs: 0,
      });

      const eventId1 = await store.storeEvent("stream-1", createMessage(1));
      const eventId2 = await store.storeEvent("stream-1", createMessage(2));
      const eventId3 = await store.storeEvent("stream-1", createMessage(3));
      const eventId4 = await store.storeEvent("stream-1", createMessage(4));

      // First event should be pruned
      const result1 = await store.getStreamIdForEventId(eventId1);
      expect(result1).toBeUndefined();

      // Other events should still exist
      expect(await store.getStreamIdForEventId(eventId2)).toBe("stream-1");
      expect(await store.getStreamIdForEventId(eventId3)).toBe("stream-1");
      expect(await store.getStreamIdForEventId(eventId4)).toBe("stream-1");
      store.stop();
    });

    it("should not prune when maxEvents is not exceeded", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 5,
        ttlMs: 0,
        sweepIntervalMs: 0,
      });

      const eventId1 = await store.storeEvent("stream-1", createMessage(1));
      const eventId2 = await store.storeEvent("stream-1", createMessage(2));
      const eventId3 = await store.storeEvent("stream-1", createMessage(3));

      expect(await store.getStreamIdForEventId(eventId1)).toBe("stream-1");
      expect(await store.getStreamIdForEventId(eventId2)).toBe("stream-1");
      expect(await store.getStreamIdForEventId(eventId3)).toBe("stream-1");
      store.stop();
    });

    it("should handle maxEvents of 0 (no storage)", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 0,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const eventId = await store.storeEvent("stream-1", createMessage(1));
      const result = await store.getStreamIdForEventId(eventId);
      expect(result).toBeUndefined();
      store.stop();
    });
  });

  describe("stop", () => {
    it("should clear the sweep timer", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 5000,
        sweepIntervalMs: 1000,
      });

      const eventId = await store.storeEvent("stream-1", createMessage(1));
      store.stop();

      // Advance time past TTL + multiple sweep intervals
      vi.advanceTimersByTime(20000);

      // Event should NOT be pruned because sweep was stopped
      const result = await store.getStreamIdForEventId(eventId);
      expect(result).toBe("stream-1");
    });

    it("should be safe to call multiple times", () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 10000,
      });

      expect(() => {
        store.stop();
        store.stop();
        store.stop();
      }).not.toThrow();
    });
  });

  describe("stream cleanup", () => {
    it("should remove empty streams when all events are pruned", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 2,
        ttlMs: 0,
        sweepIntervalMs: 0,
      });

      // Add events to stream-1
      const eventId1 = await store.storeEvent("stream-1", createMessage(1));
      await store.storeEvent("stream-2", createMessage(2));
      await store.storeEvent("stream-2", createMessage(3));

      // stream-1's event should be pruned
      const result = await store.getStreamIdForEventId(eventId1);
      expect(result).toBeUndefined();
      store.stop();
    });
  });

  describe("edge cases", () => {
    it("should handle empty streams array for replay", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const send = vi.fn();
      const result = await store.replayEventsAfter("nonexistent", { send });
      expect(result).toBe("");
      expect(send).not.toHaveBeenCalled();
      store.stop();
    });

    it("should handle concurrent stores to same stream", async () => {
      const store = new InMemoryEventStore({
        maxEvents: 100,
        ttlMs: 60000,
        sweepIntervalMs: 0,
      });

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(store.storeEvent("stream-1", createMessage(i)));
      }

      const eventIds = await Promise.all(promises);
      const uniqueIds = new Set(eventIds);
      expect(uniqueIds.size).toBe(10);
      store.stop();
    });
  });
});
