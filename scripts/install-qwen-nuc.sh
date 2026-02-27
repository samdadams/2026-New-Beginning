#!/usr/bin/env bash
# install-qwen-nuc.sh
# Installs Ollama and pulls Qwen3.5-35B-A3B on a NUC (CPU inference)
#
# Model choice: Qwen3.5-35B-A3B
#   - MoE: only 3B params active per token → low inference compute
#   - ~17GB at Q4_K_M quantization → fits in 16-32GB RAM
#   - Apache 2.0 license, available on Ollama registry

set -euo pipefail

MODEL="qwen3.5:35b-a3b-q4_K_M"
OLLAMA_PORT=11434

echo "=== Qwen3.5 NUC Setup ==="

# 1. Install Ollama if not already present
if ! command -v ollama &>/dev/null; then
  echo ">> Installing Ollama..."
  # Ollama installer requires zstd
  if ! command -v zstd &>/dev/null; then
    echo ">> Installing zstd (required by Ollama installer)..."
    sudo apt-get install -y zstd 2>/dev/null || sudo dnf install -y zstd 2>/dev/null || sudo pacman -S --noconfirm zstd 2>/dev/null || true
  fi
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo ">> Ollama already installed: $(ollama --version)"
fi

# 2. Start Ollama service (systemd or background)
if systemctl is-active --quiet ollama 2>/dev/null; then
  echo ">> Ollama service already running"
elif systemctl list-unit-files ollama.service &>/dev/null 2>&1; then
  echo ">> Starting Ollama service..."
  sudo systemctl enable --now ollama
else
  echo ">> Starting Ollama in background..."
  ollama serve &>/tmp/ollama.log &
  sleep 3
fi

# 3. Wait for Ollama to be ready
echo ">> Waiting for Ollama API on port $OLLAMA_PORT..."
for i in {1..10}; do
  if curl -sf "http://localhost:$OLLAMA_PORT/api/tags" &>/dev/null; then
    echo ">> Ollama is ready"
    break
  fi
  sleep 2
done

# 4. Pull the model (skips if already downloaded)
echo ">> Pulling $MODEL (this may take a while on first run ~17GB)..."
ollama pull "$MODEL"

# 5. Quick smoke test
echo ">> Running smoke test..."
RESPONSE=$(ollama run "$MODEL" "Reply with only: OK" 2>&1)
if echo "$RESPONSE" | grep -qi "ok"; then
  echo ">> Model responding correctly"
else
  echo ">> Smoke test response: $RESPONSE"
fi

echo ""
echo "=== Done! ==="
echo "Model:   $MODEL"
echo "API:     http://localhost:$OLLAMA_PORT"
echo "BMO:     Set model to '$MODEL' and base URL to 'http://localhost:$OLLAMA_PORT'"
echo ""
echo "To run manually:  ollama run $MODEL"
echo "To check status:  ollama list"
