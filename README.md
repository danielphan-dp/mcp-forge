# MCP Server (TypeScript)

Production-focused MCP server with Streamable HTTP and stdio transports.

## Quickstart

```bash
npm install
npm run dev
```

Run stdio transport:

```bash
npm run dev:stdio
```

Build and start:

```bash
npm run build
npm run start
```

## Endpoints

- `/mcp` (Streamable HTTP)
- `/healthz` (liveness)
- `/readyz` (readiness)
- `/metrics` (Prometheus; configurable)

## Configuration

Copy `.env.example` and set production values. Key settings:

- `MCP_API_KEY`: required for authenticated production usage.
- `MCP_ALLOWED_ORIGINS` / `MCP_ALLOWED_HOSTS`: restrict client origins/hosts.
- `MCP_SESSION_MODE`: `stateful` (default) or `stateless`.
- `MCP_MAX_SESSIONS`, `MCP_SESSION_TTL_MS`: protect memory usage.
- `MCP_EVENT_STORE`: `memory` enables resumable streams; replace for durability.
- `MCP_PROTOCOL_VERSIONS`: supported protocol versions.
- `METRICS_ENABLED`, `METRICS_API_KEY`: metrics exposure and auth.

## Production notes

- Terminate TLS at a reverse proxy and set `TRUST_PROXY=true` if needed.
- Set a strong `MCP_API_KEY` and lock down `MCP_ALLOWED_ORIGINS`/`MCP_ALLOWED_HOSTS`.
- Use a persistent event store if you need resumable streams across restarts.
- Use the `/readyz` endpoint for rollout coordination.

## Docker

```bash
docker build -t mcp-server .
docker run --env-file .env -p 3000:3000 mcp-server
```

## Available Tools

This MCP server provides **29 tools** organized into 5 categories.

### Math Tools (21 tools)

| Tool        | Description               | Parameters                         |
| ----------- | ------------------------- | ---------------------------------- |
| `add`       | Add two numbers           | `a`: number, `b`: number           |
| `subtract`  | Subtract two numbers      | `a`: number, `b`: number           |
| `multiply`  | Multiply two numbers      | `a`: number, `b`: number           |
| `divide`    | Divide two numbers        | `a`: number, `b`: number           |
| `power`     | Raise a number to a power | `base`: number, `exponent`: number |
| `modulo`    | Calculate remainder       | `a`: number, `b`: number           |
| `sqrt`      | Calculate square root     | `n`: number                        |
| `abs`       | Get absolute value        | `n`: number                        |
| `round`     | Round to nearest integer  | `n`: number                        |
| `floor`     | Round down                | `n`: number                        |
| `ceil`      | Round up                  | `n`: number                        |
| `min`       | Find minimum value        | `numbers`: number[]                |
| `max`       | Find maximum value        | `numbers`: number[]                |
| `factorial` | Calculate factorial       | `n`: number (0-170)                |
| `log`       | Base-10 logarithm         | `n`: number                        |
| `ln`        | Natural logarithm         | `n`: number                        |
| `sin`       | Sine (radians)            | `angle`: number                    |
| `cos`       | Cosine (radians)          | `angle`: number                    |
| `tan`       | Tangent (radians)         | `angle`: number                    |
| `percent`   | Calculate percentage      | `percent`: number, `value`: number |
| `average`   | Calculate average         | `numbers`: number[]                |

### String Tools (5 tools)

| Tool         | Description                    | Parameters     |
| ------------ | ------------------------------ | -------------- |
| `reverse`    | Reverse a string               | `text`: string |
| `word_count` | Count words, characters, lines | `text`: string |
| `uppercase`  | Convert to uppercase           | `text`: string |
| `lowercase`  | Convert to lowercase           | `text`: string |
| `slugify`    | Convert to URL-friendly slug   | `text`: string |

### DateTime Tools (3 tools)

| Tool          | Description                                                       | Parameters                                                                                                          |
| ------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `timestamp`   | Get current Unix timestamp, or convert between timestamp and date | `action`: "now" \| "to_date" \| "from_date", `value?`: number \| string                                             |
| `date_diff`   | Calculate difference between two dates                            | `date1`: string, `date2`: string, `unit?`: "milliseconds" \| "seconds" \| "minutes" \| "hours" \| "days" \| "weeks" |
| `format_date` | Format a date string                                              | `date?`: string, `format?`: "iso" \| "utc" \| "local" \| "date" \| "time" \| "relative", `locale?`: string          |

### Developer Tools (5 tools)

| Tool            | Description                 | Parameters                                                  |
| --------------- | --------------------------- | ----------------------------------------------------------- |
| `json_format`   | Pretty-print or minify JSON | `json`: string, `minify?`: boolean, `indent?`: number (1-8) |
| `url_encode`    | URL-encode a string         | `text`: string                                              |
| `url_decode`    | URL-decode a string         | `text`: string                                              |
| `base64_encode` | Encode string to Base64     | `text`: string, `urlSafe?`: boolean                         |
| `base64_decode` | Decode Base64 to string     | `text`: string, `urlSafe?`: boolean                         |

### Utility Tools (4 tools)

| Tool           | Description                  | Parameters                                                                    |
| -------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| `random`       | Generate random number       | `min?`: number (default: 0), `max?`: number (default: 1), `integer?`: boolean |
| `uuid`         | Generate a UUID v4           | (none)                                                                        |
| `base_convert` | Convert between number bases | `value`: string, `fromBase`: 2 \| 8 \| 10 \| 16, `toBase`: 2 \| 8 \| 10 \| 16 |
| `hash`         | Generate hash of string      | `input`: string, `algorithm?`: "md5" \| "sha1" \| "sha256" \| "sha512"        |

## Connecting to Codex CLI

Add this MCP server to [Codex CLI](https://github.com/openai/codex):

```bash
# Using STDIO transport
codex mcp add mcp-server -- node /path/to/build/stdio.js

# Or configure in ~/.codex/config.toml
```

Example `config.toml`:

```toml
[mcp_servers.mcp-server]
command = "node"
args = ["/path/to/mcp-dev-workspace/build/stdio.js"]
```

Then in Codex, you can use commands like:

- "Add 123 and 456"
- "What is 15 factorial?"
- "Calculate the square root of 144"
- "Find the average of 10, 20, 30, 40, 50"
- "Generate a UUID"
- "Convert 255 to hex"
- "Convert 0xFF to binary"
- "Hash 'hello world' with sha256"
- "Reverse the string 'hello world'"
- "Count the words in this paragraph"
- "Slugify 'Hello World! This is a Test'"
- "Get the current Unix timestamp"
- "What's the difference in days between 2025-01-01 and 2025-12-31?"
- "Format today's date as ISO"
- "Encode 'Hello World' to base64"
- "Pretty-print this JSON: {\"name\":\"test\",\"value\":123}"
- "Generate a random integer between 1 and 100"
- "Calculate sin(3.14159) and cos(3.14159)"
- "Add 100 and 200, then multiply the result by 3"
- "Generate a UUID and hash it with md5"
- "Calculate the hypotenuse: sqrt(3² + 4²)"
- "Evaluate: (25 × 4) + (100 ÷ 5) - 30"
- "Calculate compound interest: 1000 × (1.05)^10"
- "Find the quadratic: (-b + sqrt(b²-4ac)) / 2a where a=1, b=-5, c=6"
- "Calculate BMI: 70 / (1.75)² and round to 2 decimal places"
- "Percentage increase: ((150 - 120) / 120) × 100"
- "Convert 98.6°F to Celsius: (98.6 - 32) × 5/9"
