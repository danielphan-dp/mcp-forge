import { randomUUID } from "node:crypto";
import type {
  EventId,
  EventStore,
  StreamId,
} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

type StoredEvent = {
  eventId: EventId;
  streamId: StreamId;
  message: JSONRPCMessage;
  createdAt: number;
};

type InMemoryEventStoreOptions = {
  maxEvents: number;
  ttlMs: number;
  sweepIntervalMs: number;
};

export class InMemoryEventStore implements EventStore {
  private eventsById = new Map<EventId, StoredEvent>();
  private streams = new Map<StreamId, StoredEvent[]>();
  private queue: StoredEvent[] = [];
  private maxEvents: number;
  private ttlMs: number;
  private sweepTimer?: NodeJS.Timeout;

  constructor(options: InMemoryEventStoreOptions) {
    this.maxEvents = options.maxEvents;
    this.ttlMs = options.ttlMs;

    if (this.ttlMs > 0 && options.sweepIntervalMs > 0) {
      this.sweepTimer = setInterval(() => this.pruneExpired(), options.sweepIntervalMs);
      this.sweepTimer.unref();
    }
  }

  stop() {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = undefined;
    }
  }

  async storeEvent(streamId: StreamId, message: JSONRPCMessage): Promise<EventId> {
    if (this.maxEvents === 0) {
      return `${streamId}_${Date.now()}_${randomUUID()}`;
    }
    const eventId = `${streamId}_${Date.now()}_${randomUUID()}`;
    const event: StoredEvent = {
      eventId,
      streamId,
      message,
      createdAt: Date.now(),
    };

    this.eventsById.set(eventId, event);
    this.queue.push(event);
    const streamEvents = this.streams.get(streamId) ?? [];
    streamEvents.push(event);
    this.streams.set(streamId, streamEvents);

    this.pruneExpired();
    this.pruneMaxEvents();

    return eventId;
  }

  async getStreamIdForEventId(eventId: EventId): Promise<StreamId | undefined> {
    return this.eventsById.get(eventId)?.streamId;
  }

  async replayEventsAfter(
    lastEventId: EventId,
    { send }: { send: (eventId: EventId, message: JSONRPCMessage) => Promise<void> }
  ): Promise<StreamId> {
    const lastEvent = this.eventsById.get(lastEventId);
    if (!lastEvent) return "";

    const streamEvents = this.streams.get(lastEvent.streamId) ?? [];
    let found = false;

    for (const event of streamEvents) {
      if (event.eventId === lastEventId) {
        found = true;
        continue;
      }
      if (found) {
        await send(event.eventId, event.message);
      }
    }

    return lastEvent.streamId;
  }

  private pruneExpired() {
    if (this.ttlMs <= 0) return;
    const cutoff = Date.now() - this.ttlMs;
    while (this.queue.length > 0) {
      const oldest = this.queue[0];
      if (!oldest || oldest.createdAt > cutoff) break;
      this.removeEvent(oldest);
      this.queue.shift();
    }
  }

  private pruneMaxEvents() {
    if (this.maxEvents <= 0) return;
    while (this.queue.length > this.maxEvents) {
      const oldest = this.queue.shift();
      if (oldest) {
        this.removeEvent(oldest);
      }
    }
  }

  private removeEvent(event: StoredEvent) {
    this.eventsById.delete(event.eventId);
    const streamEvents = this.streams.get(event.streamId);
    if (!streamEvents) return;
    const index = streamEvents.findIndex((entry) => entry.eventId === event.eventId);
    if (index >= 0) {
      streamEvents.splice(index, 1);
    }
    if (streamEvents.length === 0) {
      this.streams.delete(event.streamId);
    }
  }
}
