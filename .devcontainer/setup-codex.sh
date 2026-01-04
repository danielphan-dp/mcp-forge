#!/usr/bin/env bash
# Setup Codex CLI configuration for this workspace
set -euo pipefail

CODEX_CONFIG_DIR="${HOME}/.codex"
CODEX_CONFIG_FILE="${CODEX_CONFIG_DIR}/config.toml"
WORKSPACE_DIR="/workspaces/mcp-dev-workspace"

echo "Setting up Codex CLI configuration..."

# Create config directory if it doesn't exist
mkdir -p "${CODEX_CONFIG_DIR}"

# Write the config file
cat > "${CODEX_CONFIG_FILE}" << EOF
[features]
web_search_request = true

[sandbox_workspace_write]
network_access = true

[mcp_servers.mcp-server]
command = "node"
args = ["${WORKSPACE_DIR}/build/stdio.js"]

[projects."${WORKSPACE_DIR}"]
trust_level = "trusted"
EOF

echo "Codex configuration written to ${CODEX_CONFIG_FILE}"
echo ""
echo "To use the MCP server with Codex:"
echo "  1. Run 'npm run build' to build the project"
echo "  2. Run 'codex' to start Codex CLI"
echo ""
cat "${CODEX_CONFIG_FILE}"
