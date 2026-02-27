# Qwen3.5 on the NUC

## Why it works

Qwen3.5-35B-A3B is a **Mixture-of-Experts (MoE)** model. Despite having 35B total parameters, it only activates ~3B per token during inference. This means:

- Memory at Q4_K_M quantization: ~17GB (fits in 16-32GB RAM)
- CPU inference is viable via Ollama/llama.cpp
- Comparable to Claude Sonnet 4.5 on benchmarks (per VentureBeat, 2026-02-24)
- Apache 2.0 license — fully local, no API costs

## Setup

Run the install script from the repo root:

```bash
bash scripts/install-qwen-nuc.sh
```

This will:
1. Install Ollama if needed
2. Start the Ollama service
3. Pull `qwen3.5:35b-a3b-q4_K_M` (~17GB download, one time)
4. Run a smoke test

## BMO Plugin Config

BMO profile (`BMO/Profiles/BMO.md`) is already updated to use:
- **Model**: `qwen3.5:35b-a3b-q4_K_M`
- **Base URL**: `http://localhost:11434` (set in Obsidian plugin settings)
- **Context window**: 8192 tokens (bump to 32768+ if your NUC has ≥32GB RAM)

In Obsidian → BMO settings → make sure "Ollama" is selected as the provider.

## Performance expectations on NUC

| NUC RAM | Tokens/sec (approx) |
|---------|---------------------|
| 16 GB   | ~2–5 tok/s (tight, may need to close other apps) |
| 32 GB   | ~5–10 tok/s         |
| 64 GB   | ~10–15 tok/s        |

For faster responses, also try the smaller `qwen3.5:7b` (dense, ~4GB).

## Useful commands

```bash
ollama list                        # see downloaded models
ollama run qwen3.5:35b-a3b-q4_K_M  # interactive chat
ollama ps                          # check running models
ollama rm qwen3.5:35b-a3b-q4_K_M   # remove if needed
```
