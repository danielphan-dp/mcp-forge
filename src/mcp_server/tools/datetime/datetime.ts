import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Pure functions for testing
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function timestampToDate(timestamp: number): {
  result?: string;
  error?: string;
} {
  if (!Number.isFinite(timestamp)) {
    return { error: "Error: Invalid timestamp" };
  }
  const date = new Date(timestamp * 1000);
  return { result: date.toISOString() };
}

export function dateToTimestamp(dateStr: string): {
  result?: number;
  error?: string;
} {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { error: "Error: Invalid date format" };
  }
  return { result: Math.floor(date.getTime() / 1000) };
}

export function dateDiff(
  date1: string,
  date2: string,
  unit:
    | "milliseconds"
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks" = "days"
): { result?: number; unit?: string; error?: string } {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return { error: "Error: Invalid date format" };
  }

  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  const divisors: Record<string, number> = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
  };

  const result = diffMs / divisors[unit];
  return { result, unit };
}

export function formatDate(
  dateStr: string | undefined,
  format: "iso" | "utc" | "local" | "date" | "time" | "relative" = "iso",
  locale: string = "en-US"
): { result?: string; error?: string } {
  const d = dateStr ? new Date(dateStr) : new Date();

  if (isNaN(d.getTime())) {
    return { error: "Error: Invalid date format" };
  }

  let result: string;
  switch (format) {
    case "iso":
      result = d.toISOString();
      break;
    case "utc":
      result = d.toUTCString();
      break;
    case "local":
      result = d.toLocaleString(locale);
      break;
    case "date":
      result = d.toLocaleDateString(locale);
      break;
    case "time":
      result = d.toLocaleTimeString(locale);
      break;
    case "relative": {
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffMs = startOfToday.getTime() - startOfDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) result = "today";
      else if (diffDays === 1) result = "yesterday";
      else if (diffDays === -1) result = "tomorrow";
      else if (diffDays > 0) result = `${diffDays} days ago`;
      else result = `in ${Math.abs(diffDays)} days`;
      break;
    }
    default:
      result = d.toISOString();
  }

  return { result };
}

export function registerTimestampTool(server: McpServer) {
  server.tool(
    "timestamp",
    "Get current Unix timestamp or convert between timestamp and date.",
    {
      operation: z
        .enum(["now", "to_date", "from_date"])
        .default("now")
        .describe(
          "'now' = current timestamp, 'to_date' = timestamp to date, 'from_date' = date to timestamp"
        ),
      value: z
        .string()
        .optional()
        .describe("Timestamp (for to_date) or ISO date string (for from_date)"),
    },
    async ({ operation, value }) => {
      if (operation === "now") {
        return {
          content: [{ type: "text", text: String(getCurrentTimestamp()) }],
        };
      } else if (operation === "to_date") {
        if (!value) {
          return {
            content: [
              {
                type: "text",
                text: "Error: value is required for to_date operation",
              },
            ],
            isError: true,
          };
        }
        const result = timestampToDate(Number(value));
        if (result.error) {
          return {
            content: [{ type: "text", text: result.error }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: result.result! }],
        };
      } else {
        if (!value) {
          return {
            content: [
              {
                type: "text",
                text: "Error: value is required for from_date operation",
              },
            ],
            isError: true,
          };
        }
        const result = dateToTimestamp(value);
        if (result.error) {
          return {
            content: [{ type: "text", text: result.error }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: String(result.result) }],
        };
      }
    }
  );
}

export function registerDateDiffTool(server: McpServer) {
  server.tool(
    "date_diff",
    "Calculate the difference between two dates.",
    {
      date1: z.string().describe("First date (ISO format or common formats)"),
      date2: z.string().describe("Second date (ISO format or common formats)"),
      unit: z
        .enum(["milliseconds", "seconds", "minutes", "hours", "days", "weeks"])
        .default("days")
        .describe("Unit for the result (default: days)"),
    },
    async ({ date1, date2, unit }) => {
      const result = dateDiff(date1, date2, unit);
      if (result.error) {
        return {
          content: [{ type: "text", text: result.error }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: `${result.result} ${result.unit}` }],
      };
    }
  );
}

export function registerFormatDateTool(server: McpServer) {
  server.tool(
    "format_date",
    "Format a date in different styles.",
    {
      date: z
        .string()
        .optional()
        .describe("Date to format (ISO format, default: now)"),
      format: z
        .enum(["iso", "utc", "local", "date", "time", "relative"])
        .default("iso")
        .describe("Output format"),
      locale: z
        .string()
        .default("en-US")
        .describe("Locale for formatting (default: en-US)"),
    },
    async ({ date, format, locale }) => {
      const result = formatDate(date, format, locale);
      if (result.error) {
        return {
          content: [{ type: "text", text: result.error }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: result.result! }],
      };
    }
  );
}
