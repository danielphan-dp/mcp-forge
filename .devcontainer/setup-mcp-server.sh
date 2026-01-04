#!/usr/bin/env bash
# Setup and build the MCP server
set -euo pipefail

WORKSPACE_DIR="/workspaces/mcp-dev-workspace"
cd "${WORKSPACE_DIR}"

echo "========================================"
echo "  MCP Server Setup"
echo "========================================"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Build the project
echo "🔨 Building TypeScript..."
npm run build
echo "✅ Build complete"
echo ""

# Step 3: Run tests
echo "🧪 Running tests..."
npm test
echo "✅ Tests passed"
echo ""

# Step 4: Setup Codex config (optional)
if command -v codex &> /dev/null; then
  echo "⚙️  Setting up Codex CLI configuration..."
  .devcontainer/setup-codex.sh
  echo ""
fi

echo "========================================"
echo "  ✅ MCP Server Ready!"
echo "========================================"
echo ""
echo "Available commands:"
echo "  npm run dev        - Start HTTP server (development)"
echo "  npm run dev:stdio  - Start STDIO server (development)"
echo "  npm start          - Start HTTP server (production)"
echo "  npm run start:stdio - Start STDIO server (production)"
echo ""
echo "To use with Codex CLI:"
echo "  codex mcp add mcp-server -- node ${WORKSPACE_DIR}/build/stdio.js"
echo ""
