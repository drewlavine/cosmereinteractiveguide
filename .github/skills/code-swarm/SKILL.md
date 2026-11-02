---
name: code-swarm
description: Runs the Cosmere Interactive Guide code swarm. The coordinator plans a feature or fix into slices, code-implementer agents build each in its own git worktree, code-review and spoiler-auditor review each slice, and the coordinator merges and pushes with Drew's OK. Use for /code-swarm, or when asked to build a feature, fix a bug, refactor, or try several designs.
---

# Code swarm

You are the coordinator: planner and integrator. The `code-implementer`
agents write the code.

## 1. Plan

- Read the app's `AGENTS.md` and `ARCHITECTURE.md`, the request or ROADMAP
  item, and trace the code it touches end to end.
- Slice only where slices own disjoint files. Most requests are one slice:
  then skip the contract step and launch one implementer.
- Each shared file (`src/data/types.ts`, `src/data/reveal.ts`,
  `src/routes.tsx`, `src/navigation.ts`, `src/styles/index.css`) belongs to
  the contract or to exactly one slice.
- Needs new content? Land the type change here, then hand the data to
  `/content-swarm`. Implementers never hand-edit generated data.
- Write `~/cig-swarm/code/<feature>/PLAN.md`: slices, owned files, branch,
  worktree, port, status. Resuming? Read it first.

## 2. Contract and worktrees

- Integration worktree:
  `git worktree add -b swarm/<feature> ~/cig-worktrees/<feature> main`, then
  `npm ci --prefer-offline --no-audit --no-fund` in it.
- More than one slice: land the contract there yourself (types, reveal
  signatures, route stub, with tests) and commit it to `swarm/<feature>`.
- Per slice:
  `git worktree add -b swarm/<feature>-<slice> ~/cig-worktrees/<feature>-<slice> swarm/<feature>`.
  Preview port 5200 + n (never 5174 or 5198).
- Commits on `swarm/*` branches are fine; anything on main needs Drew's OK.

## 3. Build

- One background `code-implementer` per slice, at most 4 at once. Each
  prompt gives the worktree, branch, base branch, owned files, port,
  contract, acceptance criteria and the feature name.
- **Bake-off** (Drew wants options, e.g. new looks): several implementers
  build the same slice in different directions (`lead-ui-ux-designer` can
  propose them first). Show Drew the desktop and phone screenshots side by
  side, merge only his pick and delete the rest.

## 4. Review each slice

In parallel, on `git diff swarm/<feature>...swarm/<feature>-<slice>`:

- the `code-review` agent, for bugs and logic errors;
- the `spoiler-auditor` agent, with its code-diff checklist.

Send findings back to the same implementer (write_agent) until both pass.

## 5. Integrate (only you)

1. In the integration worktree, `git merge --no-ff` each slice branch and
   resolve conflicts. Tick the ROADMAP item and update the README scripts
   table if scripts changed. Run the full checks from `AGENTS.md` there.
2. Ask Drew (ask_user): merge and push, merge only, or changes needed. Show
   what changed, tests, screenshots and review results. If he isn't there,
   stop here and report.
3. On OK: `scripts/main-lock.sh take coordinator`, then in main
   `git merge --no-ff --no-commit swarm/<feature>`. If git refuses because
   of uncommitted changes, stop and ask; never stash or reset. Run the full
   checks in main (they include uncommitted content), then commit with the
   trailer from `AGENTS.md`. If they fail, `git merge --abort` and fix it on
   the branch.
4. Release the lock. If pushing, watch the Pages run with
   `gh run watch <id> --exit-status` and fix forward if it fails.
5. Clean up: `git worktree remove` each worktree, `git branch -d` each
   `swarm/<feature>*` branch, stop any preview servers you started.

## Rules

- Never kill port 5174 (Drew's dev server) or processes you didn't start.
- Reports to Drew are spoiler-free: no names or plot beyond book titles.
