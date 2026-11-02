---
name: content-swarm
description: Runs the Cosmere Interactive Guide content swarm. Parallel content-writer agents, one per ~/cig-* pipeline, write, fix or date page text and art; every batch is spoiler-audited; the coordinator checks and commits with Drew's OK. Use for /content-swarm, or when asked to fill, write, fix or date content, art, chronology or journeys.
---

# Content swarm

You are the coordinator: plan, launch, watch and integrate. The
`content-writer` agents write the content; you don't.

## 1. Set up

- Read the app's `AGENTS.md`. Restate Drew's request in one line (for
  example "fill missing Stormlight places", "coverage sweep", "re-date the
  Warbreaker facts").
- `mkdir -p ~/cig-swarm/backups ~/cig-swarm/content`, then save
  `git status --porcelain` to `~/cig-swarm/content/baseline-<YYYYMMDD-HHMM>.txt`.
- Resuming? Read every `~/cig-swarm/content/<pipeline>/STATUS.md` first and
  continue from them.
- Measure the gaps in scope (listed ids against story, details or art
  files), so batches go to real gaps.

## 2. Launch writers

- One background `content-writer` per pipeline; at most 3 at once; never
  two on the same pipeline. Pipelines: characters, entries, locations,
  chronology, journeys, character art, entry/place art. Text and art for the
  same area can run together.
- Each prompt gives: the pipeline, the request and the ids or criteria, the
  priority order, the baseline file path, and
  `~/cig-swarm/content/<pipeline>/` for STATUS.
- Default priority: series Drew is reading or has read, then major, minor,
  mentioned.

## 3. While they run

- Don't poll; read each writer when it finishes. If one stops early, check
  its STATUS and relaunch it with "resume from STATUS".
- `scripts/main-lock.sh status` shows who holds the main-checkout lock. Held
  over 45 minutes by a writer that's no longer running: release it with
  `scripts/main-lock.sh release <owner>` and note that.

## 4. Integrate (only you)

1. `scripts/main-lock.sh take coordinator`.
2. In main: `npx tsc -b && npm run lint && npx vitest run --maxWorkers=4 && npm run build`
   and `git diff --check`.
3. Compare deletions in `git status --porcelain` with the baseline; restore
   anything deleted by mistake.
4. Ask Drew (ask_user): commit and push, commit only, or not yet. Show the
   counts per list and series, check results and audit results. If he isn't
   there, stop here and report.
5. Stage only the app paths the writers reported, never `git add -A`, never
   `personal_sshkey*` or `chrome.err`. Commit with the trailer from
   `AGENTS.md`.
6. Release the lock. If pushing, watch the Pages run with
   `gh run watch <id> --exit-status` and fix forward if it fails.

## Rules

- Never stash, reset, check out or clean main: it holds others' uncommitted
  work. Never kill port 5174 or processes you didn't start.
- Everything you tell Drew is counts, check results and paths. Never names,
  plot or anything beyond book titles: his reading progress keeps changing.
