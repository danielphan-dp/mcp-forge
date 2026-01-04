import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export type SessionEntry = {
  sessionId: string;
  server: McpServer;
  transport: StreamableHTTPServerTransport;
  createdAt: number;
  lastSeenAt: number;
};

export type SessionStoreOptions = {
  ttlMs: number;
  maxSessions: number;
  sweepIntervalMs: number;
  onEvict?: (entry: SessionEntry, reason: string) => void | Promise<void>;
};

export class SessionStore {
  private sessions = new Map<string, SessionEntry>();
  private sweepTimer?: NodeJS.Timeout;
  private ttlMs: number;
  private maxSessions: number;
  private sweepIntervalMs: number;
  private onEvict?: (entry: SessionEntry, reason: string) => void | Promise<void>;

  constructor(options: SessionStoreOptions) {
    this.ttlMs = options.ttlMs;
    this.maxSessions = options.maxSessions;
    this.sweepIntervalMs = options.sweepIntervalMs;
    this.onEvict = options.onEvict;
    this.startSweep();
  }

  size() {
    return this.sessions.size;
  }

  hasCapacity() {
    return this.maxSessions === 0 || this.sessions.size < this.maxSessions;
  }

  get(sessionId: string) {
    const entry = this.sessions.get(sessionId);
    if (!entry) return undefined;
    entry.lastSeenAt = Date.now();
    return entry;
  }

  set(entry: SessionEntry) {
    if (!this.hasCapacity()) return false;
    this.sessions.set(entry.sessionId, entry);
    return true;
  }

  delete(sessionId: string, reason: string) {
    const entry = this.sessions.get(sessionId);
    if (!entry) return undefined;
    this.sessions.delete(sessionId);
    if (this.onEvict) {
      void Promise.resolve(this.onEvict(entry, reason));
    }
    return entry;
  }

  list() {
    return [...this.sessions.values()];
  }

  async closeAll(reason: string) {
    const entries = this.list();
    for (const entry of entries) {
      this.sessions.delete(entry.sessionId);
    }
    if (this.onEvict) {
      for (const entry of entries) {
        await this.onEvict(entry, reason);
      }
    }
  }

  stop() {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = undefined;
    }
  }

  private startSweep() {
    if (this.ttlMs <= 0 || this.sweepIntervalMs <= 0) return;
    this.sweepTimer = setInterval(() => {
      const now = Date.now();
      for (const entry of this.sessions.values()) {
        if (entry.lastSeenAt + this.ttlMs <= now) {
          this.delete(entry.sessionId, "expired");
        }
      }
    }, this.sweepIntervalMs);
    this.sweepTimer.unref();
  }
}
