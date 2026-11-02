#!/bin/sh
# One writer at a time in the main checkout: pipeline emits, merges and full
# checks by swarm agents (.github/skills/*-swarm). Works from any worktree.
# usage: scripts/main-lock.sh take|release <owner> | status
L="$(git -C "$(dirname "$0")" rev-parse --path-format=absolute --git-common-dir)/cig-main.lock"
case "$1:$2" in
take:?*)
  until mkdir "$L" 2>/dev/null; do sleep 20; done
  echo "$2 $(date '+%F %T')" >"$L/owner"
  ;;
release:?*)
  if grep -q "^$2 " "$L/owner" 2>/dev/null; then rm -r "$L"; else
    echo "not held by $2: $(cat "$L/owner" 2>/dev/null || echo free)" >&2
    exit 1
  fi
  ;;
status:*) cat "$L/owner" 2>/dev/null || echo free ;;
*)
  echo "usage: $0 take|release <owner> | status" >&2
  exit 2
  ;;
esac
